// frontend/src/components/Users.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${editingUser._id}`, editingUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="users-table">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 Gestion des Utilisateurs</h2>
        <button className="btn-primary">+ Ajouter un utilisateur</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Crédit</th>
            <th>Type</th>
            <th>Pays</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user._id.substring(0, 8)}...</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <span className="credit-badge">{user.credit} crédits</span>
              </td>
              <td>
                <span className={`status-badge status-${user.type}`}>
                  {user.type}
                </span>
              </td>
              <td>{user.country || 'N/A'}</td>
              <td>
                <button 
                  className="btn-edit"
                  onClick={() => handleEdit(user)}
                >
                  ✏️ Modifier
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Modifier l'utilisateur</h3>
            <input
              type="text"
              value={editingUser.username}
              onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
              placeholder="Username"
            />
            <input
              type="email"
              value={editingUser.email}
              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              placeholder="Email"
            />
            <input
              type="number"
              value={editingUser.credit}
              onChange={(e) => setEditingUser({...editingUser, credit: e.target.value})}
              placeholder="Crédit"
            />
            <select
              value={editingUser.type}
              onChange={(e) => setEditingUser({...editingUser, type: e.target.value})}
            >
              <option value="user">Utilisateur</option>
              <option value="affiliate">Affilié</option>
              <option value="partner">Partenaire</option>
              <option value="team">Équipe</option>
              <option value="admin">Admin</option>
            </select>
            <div className="modal-actions">
              <button onClick={handleUpdate}>Enregistrer</button>
              <button onClick={() => setEditingUser(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
