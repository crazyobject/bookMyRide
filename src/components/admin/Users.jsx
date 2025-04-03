import React, { useState, useEffect } from 'react';
import AdminNav from './AdminNav';
import './AdminStyles.css';
import { collection, getDocs, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Notification from './Notification';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Fetch users when the component mounts
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter the users whenever the search term or users change
    filterUsers();
  }, [searchTerm, users]);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersRef = collection(db, 'users'); // Ensure collection name is 'users'
      const q = query(usersRef, orderBy('timestamp', 'desc')); // Optional: order by timestamp
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No users found in Firestore');
      } else {
        const fetchedUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(fetchedUsers); // Set the fetched users
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on the search term
  const filterUsers = () => {
    console.log('Filtering users with search term:', searchTerm);

    if (!searchTerm) {
      setFilteredUsers(users); // If no search term, show all users
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered); // Update filtered users state
  };

  // Handle sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortField === key && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(key);
    setSortDirection(direction);

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (key === 'timestamp') {
        return direction === 'asc'
          ? a.timestamp - b.timestamp
          : b.timestamp - a.timestamp;
      }
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(sortedUsers); // Update the sorted users
  };

  // Get sort icon based on the current sort field and direction
  const getSortIcon = (key) => {
    if (sortField !== key) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Format date to a readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Truncate User ID for display
  const truncateUserId = (userId) => {
    return userId.length > 10 ? `${userId.substring(0, 10)}...` : userId;
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        active: !currentStatus
      });
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, active: !currentStatus }
          : user
      ));
      setNotification({
        type: 'success',
        message: `User status successfully updated to ${!currentStatus ? 'active' : 'inactive'}`
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update user status. Please try again.'
      });
    }
  };

  return (
    <div className="admin-container">
      <AdminNav currentModule="Users Management" />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="admin-content">
        <div className="admin-card">
          <div className="users-header">
            <h2>Users Management</h2>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">Error: {error}</div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th onClick={() => handleSort('userId')} className="sortable">
                      <div className="th-content">
                        User ID {getSortIcon('userId')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('timestamp')} className="sortable">
                      <div className="th-content">
                        Date {getSortIcon('timestamp')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('kyc')} className="sortable">
                      <div className="th-content">
                        KYC Status {getSortIcon('kyc')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('active')} className="sortable">
                      <div className="th-content">
                        Status {getSortIcon('active')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td title={user.userId}>{truncateUserId(user.userId)}</td>
                      <td>{formatDate(user.timestamp)}</td>
                      <td>
                        <span className={`status-badge ${user.kyc ? 'verified' : 'pending'}`}>
                          {user.kyc ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={`status-badge ${user.active ? 'active' : 'inactive'} cursor-pointer`}
                          onClick={() => toggleStatus(user.id, user.active)}
                          title="Click to toggle status"
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;