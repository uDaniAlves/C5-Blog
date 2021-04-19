import Link from 'next/link'
import commonStyles from '../../styles/common.module.scss'
import styles from './header.module.scss'

export default function Header() {
  return (
    <nav className={commonStyles.container}>
      <section className={styles.mainSection}>
        <Link href="/">
        <a>
          <img src="../Logo.svg" alt="logo"/>
        </a>
        </Link>
      </section>
    </nav>
  )
}
