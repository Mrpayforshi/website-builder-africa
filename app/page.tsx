t styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.wrap}>
        <header className={styles.nav}>
          <div className={styles.navInner}>
            <a className={styles.logo} href="#">
              <span className={styles.logoMark}>W</span>
              Website Builder Africa
            </a>
            <nav className={styles.navLinks}>
              <a href="#">
                Product <span className={styles.chev}>▾</span>
              </a>
              <a href="#">Templates</a>
              <a href="#">Pricing</a>
              <a href="#">
                Resources <span className={styles.chev}>▾</span>
              </a>
              <a href="#">WhatsApp &amp; EcoCash</a>
            </nav>
            <div className={styles.navRight}>
              <a className={styles.navSignin} href="#">
                Log in
              </a>
              <a className={`${styles.btn} ${styles.btnWhite}`} href="#">
                Get started
              </a>
            </div>
          </div>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.eyebrowTag}>
                AI-Powered Website Builder
              </span>
              <h1>
                Describe it.
                <br />
                We build it.
              </h1>
              <p className={styles.lede}>
                The AI website builder for African entrepreneurs — with
                WhatsApp ordering, EcoCash checkout, and layby payments built
                in from the first message.
              </p>
              <div className={styles.heroCtas}>
                
                  className={`${styles.btn} ${styles.btnGradient} ${styles.btnLg}`}
                  href="#"
                >
                  Start building for free
                </a>
                
                  className={`${styles.btn} ${styles.btnOutline} ${styles.btnLg}`}
                  href="#"
                >
                  Talk to sales
                </a>
              </div>
              <div className={styles.heroFineprint}>
                <span>No credit card</span>
                <span>Free forever plan</span>
                <span>Cancel anytime</span>
              </div>
            </div>

            <div className={styles.chatCard}>
              <div className={styles.chatPlaceholder}>
                Describe the business you want to build...
              </div>
              <div className={styles.chatToolbar}>
                <div className={styles.chatAdd}>+</div>
                <div className={styles.chatToolbarRight}>
                  <div className={styles.chatMode}>
                    Build with AI <span className={styles.chev}>▾</span>
                  </div>
                  <div className={styles.chatMic}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="9"
                        y="2"
                        width="6"
                        height="12"
                        rx="3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M5 11a7 7 0 0 0 14 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 18v3"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
