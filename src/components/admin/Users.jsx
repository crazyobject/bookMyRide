import React, { useState, useEffect } from "react";
import AdminNav from "./AdminNav";
import "./AdminStyles.css";
import "./Users.css";
import {
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTrashAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPauseCircle,
  FaUsers,
  FaUserCheck,
  FaUserSlash,
  FaTimes,
} from "react-icons/fa";
import Notification from "./Notification";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showActionModal, setShowActionModal] = useState({
    show: false,
    type: null,
  });
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Fetch users when the component mounts
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter the users whenever the search term or users change
    filterUsers();
  }, [searchTerm, users, activeFilter]);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersRef = collection(db, "users"); // Ensure collection name is 'users'
      const q = query(usersRef, orderBy("timestamp", "desc")); // Optional: order by timestamp
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No users found in Firestore");
      } else {
        const fetchedUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers); // Set the fetched users
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on the search term
  const filterUsers = () => {
    let filtered = [...users];

    // Apply status filter
    if (activeFilter === "active") {
      filtered = filtered.filter((user) => user.active);
    } else if (activeFilter === "inactive") {
      filtered = filtered.filter((user) => !user.active);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredUsers(filtered);
  };

  // Handle sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortField === key && sortDirection === "asc") {
      direction = "desc";
    }
    setSortField(key);
    setSortDirection(direction);

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (key === "timestamp") {
        return direction === "asc"
          ? a.timestamp - b.timestamp
          : b.timestamp - a.timestamp;
      }
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(sortedUsers); // Update the sorted users
  };

  // Get sort icon based on the current sort field and direction
  const getSortIcon = (key) => {
    if (sortField !== key) return <FaSort />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Format date to a readable format
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate User ID for display
  const truncateUserId = (userId) => {
    return userId.length > 10 ? `${userId.substring(0, 10)}...` : userId;
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        active: !currentStatus,
      });
      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, active: !currentStatus } : user,
        ),
      );
      setNotification({
        type: "success",
        message: `User status successfully updated to ${!currentStatus ? "active" : "inactive"}`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      setNotification({
        type: "error",
        message: "Failed to update user status. Please try again.",
      });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleDeleteSelected = async () => {
    try {
      setLoading(true);
      for (const userId of selectedUsers) {
        await deleteDoc(doc(db, "users", userId));
      }

      // Update local state
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
      setSelectedUsers([]); // Clear selection
      setShowDeleteModal(false);

      setNotification({
        type: "success",
        message: `Successfully deleted ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Error deleting users:", error);
      setNotification({
        type: "error",
        message: "Failed to delete users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new functions for activate/inactivate
  const handleActivateSelected = async () => {
    try {
      setLoading(true);
      const batch = writeBatch(db);

      selectedUsers.forEach((userId) => {
        const userRef = doc(db, "users", userId);
        batch.update(userRef, { active: true });
      });

      await batch.commit();

      // Update local state
      setUsers(
        users.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, active: true } : user,
        ),
      );
      setSelectedUsers([]);
      setShowActionModal({ show: false, type: null });

      setNotification({
        type: "success",
        message: `Successfully activated ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Error activating users:", error);
      setNotification({
        type: "error",
        message: "Failed to activate users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInactivateSelected = async () => {
    try {
      setLoading(true);
      const batch = writeBatch(db);

      selectedUsers.forEach((userId) => {
        const userRef = doc(db, "users", userId);
        batch.update(userRef, { active: false });
      });

      await batch.commit();

      // Update local state
      setUsers(
        users.map((user) =>
          selectedUsers.includes(user.id) ? { ...user, active: false } : user,
        ),
      );
      setSelectedUsers([]);
      setShowActionModal({ show: false, type: null });

      setNotification({
        type: "success",
        message: `Successfully inactivated ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}`,
      });
    } catch (error) {
      console.error("Error inactivating users:", error);
      setNotification({
        type: "error",
        message: "Failed to inactivate users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update the ActionModal component
  const ActionModal = () => {
    const getModalContent = () => {
      switch (showActionModal.type) {
        case "delete":
          return {
            icon: <FaExclamationTriangle className="text-red-500 text-3xl" />,
            iconContainerClass: "bg-red-100",
            title: "Confirm Deletion",
            message: `Are you sure you want to delete ${selectedUsers.length} selected user${selectedUsers.length > 1 ? "s" : ""}? This action cannot be undone.`,
            action: handleDeleteSelected,
            buttonText: "Delete Users",
            buttonIcon: <FaTrashAlt />,
            buttonClass: "modal-button-delete",
          };
        case "activate":
          return {
            icon: <FaCheckCircle className="text-green-500 text-3xl" />,
            iconContainerClass: "bg-green-100",
            title: "Confirm Activation",
            message: `Are you sure you want to activate ${selectedUsers.length} selected user${selectedUsers.length > 1 ? "s" : ""}?`,
            action: handleActivateSelected,
            buttonText: "Activate Users",
            buttonIcon: <FaCheckCircle />,
            buttonClass: "modal-button-activate",
          };
        case "inactivate":
          return {
            icon: <FaPauseCircle className="text-yellow-500 text-3xl" />,
            iconContainerClass: "bg-yellow-100",
            title: "Confirm Inactivation",
            message: `Are you sure you want to inactivate ${selectedUsers.length} selected user${selectedUsers.length > 1 ? "s" : ""}?`,
            action: handleInactivateSelected,
            buttonText: "Inactivate Users",
            buttonIcon: <FaPauseCircle />,
            buttonClass: "modal-button-inactivate",
          };
        default:
          return null;
      }
    };

    const content = getModalContent();
    if (!content) return null;

    return (
      <div className="delete-modal-overlay">
        <div className="delete-modal">
          <div className="flex flex-col items-center">
            <div
              className={`delete-modal-icon-container ${content.iconContainerClass}`}
            >
              {content.icon}
            </div>
            <h3 className="delete-modal-title">{content.title}</h3>
            <p className="delete-modal-message">{content.message}</p>
            <div className="delete-modal-buttons">
              <button
                onClick={() => setShowActionModal({ show: false, type: null })}
                className="modal-button modal-button-cancel"
              >
                Cancel
              </button>
              <button
                onClick={content.action}
                className={`modal-button ${content.buttonClass}`}
              >
                {content.buttonIcon}
                {content.buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add these new calculations
  const userStats = {
    total: users.length,
    active: users.filter((user) => user.active).length,
    inactive: users.filter((user) => !user.active).length,
  };

  // Add handler for capsule clicks
  const handleFilterClick = (filter) => {
    // If clicking the same filter, clear it
    if (activeFilter === filter) {
      setActiveFilter("all");
    } else {
      setActiveFilter(filter);
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
      {showActionModal.show && <ActionModal />}
      <div className="admin-content">
        <div className="admin-card">
          <div className="users-header">
            <div className="header-left">
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
            <div className="user-stats">
              <div
                className={`stat-capsule total ${activeFilter === "all" ? "active-filter" : ""}`}
                onClick={() => handleFilterClick("all")}
                role="button"
                tabIndex={0}
                title="Show all users"
              >
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Users</span>
                  <span className="stat-value">{userStats.total}</span>
                </div>
              </div>
              <div
                className={`stat-capsule active ${activeFilter === "active" ? "active-filter" : ""}`}
                onClick={() => handleFilterClick("active")}
                role="button"
                tabIndex={0}
                title="Show only active users"
              >
                <div className="stat-icon">
                  <FaUserCheck />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Active</span>
                  <span className="stat-value">{userStats.active}</span>
                </div>
              </div>
              <div
                className={`stat-capsule inactive ${activeFilter === "inactive" ? "active-filter" : ""}`}
                onClick={() => handleFilterClick("inactive")}
                role="button"
                tabIndex={0}
                title="Show only inactive users"
              >
                <div className="stat-icon">
                  <FaUserSlash />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Inactive</span>
                  <span className="stat-value">{userStats.inactive}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Show active filter indicator if a filter is applied */}
          {activeFilter !== "all" && (
            <div className="active-filter-indicator">
              Showing {activeFilter} users
              <button
                className="clear-filter"
                onClick={() => setActiveFilter("all")}
                title="Clear filter"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div className="action-buttons">
              <button
                onClick={() =>
                  setShowActionModal({ show: true, type: "activate" })
                }
                className="action-button activate-button"
              >
                <FaCheckCircle />
                Activate Selected ({selectedUsers.length})
              </button>
              <button
                onClick={() =>
                  setShowActionModal({ show: true, type: "inactivate" })
                }
                className="action-button inactivate-button"
              >
                <FaPauseCircle />
                Inactivate Selected ({selectedUsers.length})
              </button>
              <button
                onClick={() =>
                  setShowActionModal({ show: true, type: "delete" })
                }
                className="action-button delete-button"
              >
                <FaTrashAlt />
                Delete Selected ({selectedUsers.length})
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <div className="error-message">Error: {error}</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={
                              selectedUsers.length === filteredUsers.length &&
                              filteredUsers.length > 0
                            }
                            onChange={handleSelectAll}
                          />
                        </div>
                        <span>All</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th
                      onClick={() => handleSort("userId")}
                      className="sortable"
                    >
                      <div className="th-content">
                        User ID {getSortIcon("userId")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("timestamp")}
                      className="sortable"
                    >
                      <div className="th-content">
                        Date {getSortIcon("timestamp")}
                      </div>
                    </th>
                    <th onClick={() => handleSort("kyc")} className="sortable">
                      <div className="th-content">
                        KYC Status {getSortIcon("kyc")}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort("active")}
                      className="sortable"
                    >
                      <div className="th-content">
                        Status {getSortIcon("active")}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.name}
                      </td>
                      <td title={user.userId}>{truncateUserId(user.userId)}</td>
                      <td>{formatDate(user.timestamp)}</td>
                      <td>
                        <span
                          className={`status-badge ${user.kyc ? "verified" : "pending"}`}
                        >
                          {user.kyc ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${user.active ? "active" : "inactive"} cursor-pointer`}
                          onClick={() => toggleStatus(user.id, user.active)}
                          title="Click to toggle status"
                        >
                          {user.active ? "Active" : "Inactive"}
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
