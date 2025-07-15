import PropTypes from 'prop-types';

export default function CardKPI({ label, value }) {
    return (
    <div className="kpi-card">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
    </div>
    );
}

CardKPI.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};