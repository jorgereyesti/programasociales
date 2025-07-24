import React from 'react';
import PropTypes from 'prop-types';

export default function TablaEntregas({ data }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Fecha entrega</th>
          <th>Beneficiario</th>
          <th>DNI</th>
          <th>CIC</th>
          <th>Producto</th>
          <th>Cantidad (u. o Kg)</th>
          <th>Detalles</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(data) && data.map((e) => (
          <tr key={e.id}>
            <td>{new Date(e.fecha_entrega).toLocaleDateString()}</td>
            <td>{e.beneficiario.nombre}</td>
            <td>{e.beneficiario.dni}</td>
            <td>{e.beneficiario.cic?.nombre || ''}</td>
            <td>{e.producto.nombre}</td>
            <td>{e.cantidad}</td>
            <td>{e.detalles}</td>
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
      fecha_entrega: PropTypes.string.isRequired,
      beneficiario: PropTypes.shape({
        nombre: PropTypes.string.isRequired,
        dni: PropTypes.string.isRequired,
        cic: PropTypes.shape({ nombre: PropTypes.string }).isRequired,
      }).isRequired,
      producto: PropTypes.shape({
        id: PropTypes.number,
        nombre: PropTypes.string.isRequired
      }).isRequired,
      cantidad: PropTypes.number.isRequired,
      detalles: PropTypes.string,
    })
  ).isRequired,
};
