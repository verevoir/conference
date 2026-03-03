export function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={innerStyle}>
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem',
          }}
        >
          Powered by NextLake
        </p>
      </div>
    </footer>
  );
}

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid var(--color-border)',
  padding: 'var(--space-lg) 0',
  marginTop: 'var(--space-xl)',
};

const innerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 var(--space-lg)',
  textAlign: 'center',
};
