import Avatar from '../common/Avatar';
import Button from '../common/Button';

const IncomingCallModal = ({ caller, onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center">
      <div className="text-center">
        <Avatar uri={caller?.avatarUrl} name={caller?.displayName} size={120} />
        
        <h2 className="text-3xl font-bold mt-6">{caller?.displayName}</h2>
        <p className="text-snap-white50 text-lg mt-1">Incoming Video Call...</p>

        <div className="flex gap-6 mt-16">
          <Button
            label="Decline"
            onPress={onDecline}
            variant="secondary"
          />
          <Button
            label="Accept"
            onPress={onAccept}
            variant="primary"
          />
        </div>

        <button className="mt-8 text-snap-white50 underline">
          Send Message Instead
        </button>
      </div>
    </div>
  );
};

export default IncomingCallModal;