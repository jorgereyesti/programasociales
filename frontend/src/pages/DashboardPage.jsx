import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CardKPI from '../components/CardKPI';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getDashboardStats } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      }
    }
    fetchStats();
  }, []);

  if (!stats) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <section className="page-section">
      {/* KPIs principales */}
      <h2>Panaderia Social de la Municipalidad de SMT</h2>
      <div className="kpi-container">
        <CardKPI label="Familias beneficiadas" value={stats.familiasBeneficiadas} />
        <CardKPI label="Personas Beneficiadas" value={stats.personasAtendidas + stats.familiasBeneficiadas} />
        <CardKPI label="Cobertura (%)" value={`${stats.coberturaPorcentaje}%`} />
        <CardKPI label="Familias sin entrega" value={stats.familiasSinEntrega} />
      </div>

      {/* Gráficos de tendencias */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Evolución mensual de entregas</h3>
          <ChartTrend data={stats.monthlyTrend} />
        </div>
        <div className="chart-card">
          <h3>Productos distribuidos</h3>
          <ChartProducts data={stats.productsTrend} />
        </div>
      </div>

      {/* Ranking de CIC */}
      <div className="ranking-container">
        <h3>Ranking de CIC</h3>
        <RankingTable data={stats.rankingCIC} />
      </div>
    </section>
  );
}

// Componente para línea de tiempo de entregas
function ChartTrend({ data }) {
  return (
    <LineChart width={600} height={300} data={data} className="chart-responsive">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="mes" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="entregas" name="Entregas" />
    </LineChart>
  );
}

ChartTrend.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      mes: PropTypes.string.isRequired,
      entregas: PropTypes.number.isRequired
    })
  ).isRequired
};

// Componente para barras de productos distribuidos
function ChartProducts({ data }) {
  return (
    <BarChart width={600} height={300} data={data} className="chart-responsive">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="producto" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="cantidad" name="Cantidad" />
    </BarChart>
  );
}

ChartProducts.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      producto: PropTypes.string.isRequired,
      cantidad: PropTypes.number.isRequired
    })
  ).isRequired
};

// Tabla de ranking de CIC
function RankingTable({ data }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>CIC</th>
          <th>Entregas</th>
          <th>Familias Beneficiadas</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td>{row.cic}</td>
            <td>{row.entregas}</td>
            <td>{row.familias}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

RankingTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      cic: PropTypes.string.isRequired,
      entregas: PropTypes.number.isRequired,
      familias: PropTypes.number.isRequired
    })
  ).isRequired
};
