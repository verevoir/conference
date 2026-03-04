import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.text}>Powered by NextLake</p>
      </div>
    </footer>
  );
}
