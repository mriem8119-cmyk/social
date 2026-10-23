

import { useQuery } from '@tanstack/react-query'

async function fetchProfile() {
  const response = await fetch('https://route-posts.routemisr.com/users/profile-data', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.message || 'Failed to load profile')
  }

  return data.data.user
}

function Profile() {
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  })

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (isError) {
    return <p className="form-message">{error.message}</p>
  }

  return (
    <div className="profile-card">
      <img className="profile-avatar" src={user.photo} alt={user.name} />
      <h2>{user.name}</h2>
      <p className="post-date">@{user.username}</p>
      <p>{user.email}</p>

      <div className="profile-stats">
        <div>
          <strong>{user.followersCount}</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>{user.followingCount}</strong>
          <span>Following</span>
        </div>
      </div>
    </div>
  )
}

export default Profile