import PropTypes from 'prop-types';

export default function TablaBeneficiarios({ data, onEdit, onDelete }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Apellido y Nombre</th>
          <th>DNI</th>
          <th>CIC</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.map((b) => (
          <tr key={b.id_programa_social + '-' + b.dni}>
            <td>{b.nombre}</td>
            <td>{b.dni}</td>
            <td>{b.cic_nombre}</td>
            <td>
              <div className="action-buttons">
                <button 
                  className="btn-edit"
                  onClick={() => onEdit(b.id)}
                  title="Editar beneficiario"
                >
                  ✏️ Editar
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => onDelete(b.id)}
                  title="Eliminar beneficiario"
                >
                  🗑️ Borrar
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

TablaBeneficiarios.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      nombre: PropTypes.string,
      dni: PropTypes.string,
      cic_nombre: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};