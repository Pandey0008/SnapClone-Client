import Button from '../common/Button';
import Avatar from '../common/Avatar';

const CallEndedSummary = ({ peer, duration, connectionType, onCallAgain, onMessage }) => {
  const mins = Math.floor(duration / 60);
  const secs = (duration % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-snap-dark flex flex-col items-center justify-center px-6 text-center">
      <Avatar uri={peer?.avatarUrl} name={peer?.displayName} size={100} />
      
      <h2 className="text-3xl font-bold mt-6">Call Ended</h2>
      <p className="text-snap-white50 mt-2">{mins}:{secs}</p>

      <div className="mt-8 bg-snap-darkMid px-8 py-4 rounded-3xl">
        <p className="text-sm">Connected via <span className="text-call-green font-medium">{connectionType?.toUpperCase()}</span></p>
      </div>

      <div className="flex gap-4 mt-12 w-full max-w-xs">
        <Button label="Call Again" onPress={onCallAgain} variant="primary" />
        <Button label="Message" onPress={onMessage} variant="ghost" />
      </div>
    </div>
  );
};

export default CallEndedSummary;