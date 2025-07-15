import PropTypes from 'prop-types';

export default function TablaBeneficiarios({ data }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Apellido y Nombre</th>
          <th>DNI</th>
          <th>CIC</th>
        </tr>
      </thead>
      <tbody>
        {data.map((b) => (
          <tr key={b.id_programa_social + '-' + b.dni}>
            <td>{b.nombre}</td>
            <td>{b.dni}</td>
            <td>{b.cic_nombre}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

TablaBeneficiarios.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id_programa_social: PropTypes.number,
      nombre: PropTypes.string,
      dni: PropTypes.string,
      cic_nombre: PropTypes.string,
    })
  ).isRequired,
};