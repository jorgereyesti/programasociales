import React from 'react';
import PropTypes from 'prop-types';

export default function TablaEntregas({ data }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Apellido y Nombre</th>
          <th>DNI</th>
          <th>Lugar</th>
          <th>Entregado</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e) => (
          <tr key={e.id}>
            <td>{new Date(e.fecha).toLocaleDateString()}</td>
            <td>{`${e.beneficiario.apellido}, ${e.beneficiario.nombre}`}</td>
            <td>{e.beneficiario.dni}</td>
            <td>{e.cic_nombre || e.lugar}</td>
            <td>{e.entregado ? 'Sí' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

TablaEntregas.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fecha: PropTypes.string.isRequired,
      beneficiario: PropTypes.shape({
        apellido: PropTypes.string.isRequired,
        nombre: PropTypes.string.isRequired,
        dni: PropTypes.string.isRequired,
      }).isRequired,
      cic_nombre: PropTypes.string,
      lugar: PropTypes.string,
      entregado: PropTypes.bool.isRequired,
    })
  ).isRequired,
};
