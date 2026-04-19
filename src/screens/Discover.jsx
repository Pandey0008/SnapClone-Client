import { useState, useEffect } from 'react';
import { useAppSelector } from '../redux/hooks';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Discover = () => {
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search'); // search | requests
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users based on search query
  useEffect(() => {
    if (!accessToken) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = 'http://localhost:3000/api/v1/users/all';
        if (searchQuery.trim().length >= 2) {
          url = `http://localhost:3000/api/v1/users/search?query=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, accessToken]);

  // Fetch pending requests
  useEffect(() => {
    if (!accessToken || activeTab !== 'requests') return;

    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/users/requests', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }

        const data = await response.json();
        setRequests(data.requests || []);
      } catch (err) {
        console.error('Error fetching requests:', err);
      }
    };

    fetchRequests();
  }, [accessToken, activeTab]);

  const handleAddFriend = async (recipientId) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/users/request/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ recipientId })
      });

      if (response.ok) {
        // Update user status locally
        setUsers(users.map(u => 
          u._id === recipientId ? { ...u, status: 'requesting' } : u
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send request');
      }
    } catch (err) {
      alert('Error sending friend request');
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/users/request/accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ senderId })
      });

      if (response.ok) {
        setRequests(requests.filter(r => r._id !== senderId));
      } else {
        alert('Failed to accept request');
      }
    } catch (err) {
      alert('Error accepting request');
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/users/request/reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ senderId })
      });

      if (response.ok) {
        setRequests(requests.filter(r => r._id !== senderId));
      } else {
        alert('Failed to reject request');
      }
    } catch (err) {
      alert('Error rejecting request');
    }
  };

  return (
    <div className="min-h-screen bg-snap-dark pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-snap-dark border-b border-white/10 z-10 px-6 py-5">
        <h1 className="text-4xl font-bold">Discover</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'search' ? 'text-snap-yellow border-b-2 border-snap-yellow' : 'text-snap-white50'}`}
        >
          Search
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition ${activeTab === 'requests' ? 'text-snap-yellow border-b-2 border-snap-yellow' : 'text-snap-white50'}`}
        >
          Requests
          {requests.length > 0 && <Badge count={requests.length} />}
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="p-6">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-snap-darkMid border border-white/10 rounded-3xl px-6 py-4 text-lg focus:outline-none focus:border-snap-yellow"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <EmptyState
              icon="⚠️"
              title="Error loading users"
              subtitle={error}
            />
          ) : (
            <div className="space-y-3">
              {users.map((person) => (
                <div
                  key={person._id}
                  className="flex items-center justify-between bg-snap-darkMid rounded-3xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar uri={person.avatarUrl} name={person.displayName} size={56} />
                    <div>
                      <p className="font-semibold text-lg">{person.displayName}</p>
                      <p className="text-sm text-snap-white50">@{person.username || 'user'}</p>
                      <p className="text-xs text-snap-white50">{person.mutual} mutual friends</p>
                    </div>
                  </div>

                  <Button
                    label={
                      person.status === 'friends' ? 'Friends' :
                      person.status === 'pending' ? 'Pending' :
                      person.status === 'requesting' ? 'Sent' :
                      'Add Friend'
                    }
                    onPress={() => handleAddFriend(person._id)}
                    variant={person.status === 'friends' ? 'outline' : 'primary'}
                    disabled={person.status !== 'none'}
                    className="text-sm px-6 py-2"
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && users.length === 0 && searchQuery && !error && (
            <EmptyState
              icon="🔍"
              title="No users found"
              subtitle="Try different keywords"
            />
          )}

          {!loading && users.length === 0 && !searchQuery && !error && (
            <EmptyState
              icon="👥"
              title="Start searching"
              subtitle="Search for users to discover new friends"
            />
          )}
        </div>
      )}

      {/* Friend Requests Tab */}
      {activeTab === 'requests' && (
        <div className="p-6">
          {requests.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No pending requests"
              subtitle="When someone sends you a friend request, it will appear here"
            />
          ) : (
            <div className="space-y-3">
              {requests.map((person) => (
                <div
                  key={person._id}
                  className="flex items-center justify-between bg-snap-darkMid rounded-3xl p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar uri={person.avatarUrl} name={person.displayName} size={56} />
                    <div>
                      <p className="font-semibold text-lg">{person.displayName}</p>
                      <p className="text-sm text-snap-white50">@{person.username || 'user'}</p>
                      <p className="text-xs text-snap-white50">{person.mutual} mutual friends</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      label="Accept"
                      onPress={() => handleAcceptRequest(person._id)}
                      variant="primary"
                      className="text-sm px-4 py-2"
                    />
                    <Button
                      label="Reject"
                      onPress={() => handleRejectRequest(person._id)}
                      variant="outline"
                      className="text-sm px-4 py-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;