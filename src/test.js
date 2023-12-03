import React, { useState, useEffect } from "react";
import axios from "axios";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { FcDeleteDatabase } from "react-icons/fc";
import { FaEdit } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import "./App.css";

const AdminDashboard = () => {
  const [originalUsers, setOriginalUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    // Fetch data from the API endpoint
    axios
      .get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      )
      .then((response) => {
        setOriginalUsers(response.data);
        setUsers(response.data.map((user) => ({ ...user, editing: false })));
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const totalPages = Math.ceil(users.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handleSearch = (value) => {
    setSearchTerm(value);
    const filteredUsers = originalUsers.filter(
      (user) =>
        user.id.toLowerCase().includes(value.toLowerCase()) ||
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.role.toLowerCase().includes(value.toLowerCase())
    );
    setUsers(filteredUsers.map((user) => ({ ...user, editing: false })));
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value === "") {
      setUsers(originalUsers.map((user) => ({ ...user, editing: false }))); // Restore original data when search term is empty
    } else {
      handleSearch(value);
    }
  };

  const handlePaginationClick = (page) => {
    setCurrentPage(page);
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === currentUsers.length ? [] : [...currentUsers]
    );
  };

  const handleSelectRow = (user) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(user)
        ? prevSelected.filter((selectedUser) => selectedUser !== user)
        : [...prevSelected, user]
    );
  };

  const handleDelete = (user) => {
    const updatedUsers = users.filter((u) => u !== user);
    setUsers(updatedUsers);
    setSelectedRows(
      selectedRows.filter((selectedUser) => selectedUser !== user)
    );
  };
  const handleFieldChange = (e, user, field) => {
    const updatedUsers = users.map((u) =>
      u === user ? { ...u, [field]: e.target.value } : u
    );
    setUsers(updatedUsers);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) {
      // Show a confirmation popup before proceeding
      const confirmDelete = window.confirm(
        "Are you sure you want to delete all selected records?"
      );
      if (!confirmDelete) {
        return;
      }
    }

    const updatedUsers = users.filter((user) => !selectedRows.includes(user));
    setUsers(updatedUsers);
    setSelectedRows([]);
  };

  const handleEdit = (user) => {
    const updatedUsers = users.map((u) =>
      u === user ? { ...u, editing: !u.editing } : u
    );
    setUsers(updatedUsers);
  };

  return (
    <div>
      <div className="top-bar">
        <input
          className="search"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => handleInputChange(e)}
        />
         <button className="del-select" onClick={handleDeleteSelected}>
          <FcDeleteDatabase />
        </button>
      </div>
     


      <table>
        <thead>
          <tr className="header">
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === currentUsers.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr
              key={user.id}
              style={{
                background: selectedRows.includes(user) ? "#ddd" : "none",
              }}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(user)}
                  onChange={() => handleSelectRow(user)}
                />
              </td>
              <td>
                {user.editing ? (
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => handleFieldChange(e, user, "name")}
                    style={{ width: "100px" }}
                  />
                ) : (
                  user.name
                )}
              </td>
              <td>
                {user.editing ? (
                  <input
                    type="text"
                    value={user.email}
                    onChange={(e) => handleFieldChange(e, user, "email")}
                    style={{ width: "150px" }}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {user.editing ? (
                  <input
                    type="text"
                    value={user.role}
                    onChange={(e) => handleFieldChange(e, user, "role")}
                    style={{ width: "60px" }}
                  />
                ) : (
                  user.role
                )}
              </td>
              <td>
                <button className="edit" onClick={() => handleEdit(user)}>
                  {user.editing ? <IoIosSave /> : <FaEdit />}
                </button>
                <button className="delete" onClick={() => handleDelete(user)}>
                  <RiDeleteBin2Fill />
                </button>
                <button
                  className="save"
                  style={{ display: "none" }}
                  onClick={() => {}}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        

        <span>
          {selectedRows.length} of {users.length} row(s) selected
        </span>

        <div className="pages">
          <span style={{ paddingRight: "18px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="first-page"
            onClick={() => handlePaginationClick(1)}
          >
            &lt;&lt;
          </button>
          <button
            className="previous-page"
            onClick={() => handlePaginationClick(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => handlePaginationClick(page + 1)}
            >
              {page + 1}
            </button>
          ))}
          <button
            className="next-page"
            onClick={() => handlePaginationClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
          <button
            className="last-page"
            onClick={() => handlePaginationClick(totalPages)}
          >
            &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
