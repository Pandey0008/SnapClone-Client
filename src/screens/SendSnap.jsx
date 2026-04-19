import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import RecipientPicker from '../components/snap/RecipientPicker';
import Button from '../components/common/Button';
import CaptionInput from '../components/camera/CaptionInput'; // We'll create this below

const SendSnap = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const { uri, type } = location.state || {}; // Passed from Camera

  const [caption, setCaption] = useState('');
  const [step, setStep] = useState('preview'); // preview | recipients
  const [selectedRecipients, setSelectedRecipients] = useState([]);

  // Mock friends (replace with RTK Query later)
  const friends = [
    { _id: '1', displayName: 'Rahul Sharma', username: 'rahul', avatarUrl: '' },
    { _id: '2', displayName: 'Priya Singh', username: 'priya', avatarUrl: '' },
    { _id: '3', displayName: 'Aman Verma', username: 'aman', avatarUrl: '' },
  ];

  const handleSend = () => {
    if (selectedRecipients.length === 0) return;

    // TODO: Call useSendSnapMutation() later
    console.log('Sending snap to:', selectedRecipients, 'Caption:', caption);

    alert('Snap sent successfully! 👻');
    navigate('/camera'); // Return to camera after send
  };

  if (!uri) {
    return <div className="text-center pt-20">No media selected</div>;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Preview Step */}
      {step === 'preview' && (
        <>
          <div className="flex-1 relative">
            <img
              src={uri}
              alt="preview"
              className="w-full h-full object-cover"
            />

            {/* Caption Overlay */}
            <div className="absolute bottom-24 left-0 right-0 px-6">
              <CaptionInput
                value={caption}
                onChange={setCaption}
                maxLength={150}
              />
            </div>
          </div>

          <div className="p-6 bg-snap-darkMid border-t border-white/10 flex gap-4">
            <Button
              label="Cancel"
              onPress={() => navigate('/camera')}
              variant="ghost"
            />
            <Button
              label="Choose Recipients →"
              onPress={() => setStep('recipients')}
              variant="primary"
            />
          </div>
        </>
      )}

      {/* Recipients Step */}
      {step === 'recipients' && (
        <RecipientPicker
          friends={friends}
          selected={selectedRecipients}
          onConfirm={(ids) => {
            setSelectedRecipients(ids);
            handleSend();
          }}
        />
      )}
    </div>
  );
};

export default SendSnap;