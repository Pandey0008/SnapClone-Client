/**
 * WebRTC Video Call Helper
 * Handles peer-to-peer video calling functionality
 */

class RTCConnection {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.iceCandidates = [];
    this.constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }
    };
  }

  /**
   * Get local media stream (camera + microphone)
   */
  async getLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(this.constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  /**
   * Initialize peer connection
   */
  initPeerConnection(iceServers = []) {
    const config = {
      iceServers: iceServers.length > 0 ? iceServers : [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
      ]
    };

    this.peerConnection = new RTCPeerConnection(config);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.iceCandidates.push(event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      // console.log('Connection state:', this.peerConnection.connectionState);
    };
  }

  /**
   * Create SDP offer
   */
  async createOffer() {
    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Create SDP answer
   */
  async createAnswer(offer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Add remote answer
   */
  async addRemoteAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate) {
    try {
      if (candidate && this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Switch camera
   */
  async switchCamera() {
    try {
      const constraints = {
        ...this.constraints,
        video: {
          ...this.constraints.video,
          facingMode: this.constraints.video.facingMode === 'user' ? 'environment' : 'user'
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = newStream.getVideoTracks()[0];
      
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      // Update local stream
      this.localStream.getVideoTracks()[0].stop();
      this.constraints.video.facingMode = constraints.video.facingMode;
      this.localStream = newStream;

      return this.localStream;
    } catch (error) {
      console.error('Error switching camera:', error);
      throw error;
    }
  }

  /**
   * End call and clean up
   */
  endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
    this.iceCandidates = [];
  }

  /**
   * Get connection stats
   */
  async getStats() {
    if (!this.peerConnection) return null;

    const stats = await this.peerConnection.getStats();
    const result = {};

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp') {
        result.inbound = {
          bytesReceived: report.bytesReceived,
          packetsLost: report.packetsLost,
          jitter: report.jitter
        };
      } else if (report.type === 'outbound-rtp') {
        result.outbound = {
          bytesSent: report.bytesSent,
          framesSent: report.framesSent
        };
      }
    });

    return result;
  }
}

export default RTCConnection;
