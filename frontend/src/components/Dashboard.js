// frontend/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const barData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: [12, 19, 3, 5, 2, 3, 15],
        backgroundColor: 'rgba(102, 126, 234, 0.5)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Utilisateurs', 'Affiliés', 'Partenaires', 'Équipe'],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0'
        ],
      },
    ],
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="dashboard">
      <h1>📊 Tableau de bord</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Utilisateurs</h3>
          <div className="value">{stats.totalUsers || 0}</div>
          <p>+12% ce mois</p>
        </div>
        
        <div className="stat-card">
          <h3>Crédit Total</h3>
          <div className="value">{stats.totalCredit?.[0]?.total || 0}</div>
          <p>En circulation</p>
        </div>
        
        <div className="stat-card">
          <h3>Transactions</h3>
          <div className="value">1,234</div>
          <p>Aujourd'hui: 45</p>
        </div>
        
        <div className="stat-card">
          <h3>Taux de conversion</h3>
          <div className="value">24.5%</div>
          <p>+2.1% vs mois dernier</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px' }}>
          <h3>Activité des inscriptions</h3>
          <Bar data={barData} />
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px' }}>
          <h3>Répartition par type</h3>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
