import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.scene}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.wrap}>
        <header className={styles.nav}>
          <div className={styles.navInner}>
            <a className={styles.logo} href="#">
              <span className={styles.logoMark}>R</span>
              Rivo
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
                Rivo is the AI website builder for African entrepreneurs —
                with WhatsApp ordering, EcoCash checkout, and layby payments
                built in from the first message.
              </p>
              <div className={styles.heroCtas}>
                <a className={`${styles.btn} ${styles.btnGradient} ${styles.btnLg}`} href="#">Start building for free</a>
                <a className={`${styles.btn} ${styles.btnOutline} ${styles.btnLg}`} href="#">Talk to sales</a>
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
                        strokeWidth="1.6"
                      />
                      <path
                        d="M5 10v1a7 7 0 0 0 14 0v-1"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 18v3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.infra}>
          <h2>Built to run, not just to launch</h2>
          <p className={styles.infraIntro}>
            Rivo runs on the same infrastructure serious products run on —
            so the site you describe in a chat can handle real customers,
            real orders, and real payments from day one.
          </p>

          <div className={styles.infraFeature}>
            <h3>Infrastructure, handled</h3>
            <p>
              Hosting, SSL, and your database are set up automatically.
              WhatsApp ordering and EcoCash checkout are wired in from the
              first message — your code and your customer data stay yours.
            </p>
          </div>

          <div className={styles.device}>
            <div className={styles.deviceFrameWrap}>
              <div className={styles.deviceFrame}>
                <div className={styles.deviceBar}>
                  <div className={styles.dots}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className={styles.urlPill}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    chikwiya.rivo.app
                  </div>
                  <div className={styles.frameIcons}>
                    <span />
                    <span />
                  </div>
                </div>
                <div className={styles.frameBody} />
              </div>
            </div>

            <div className={styles.nodes}>
              <svg width="100%" height="100%" className={styles.connectors}>
                <line x1="48" y1="139" x2="122" y2="229" />
                <line x1="140" y1="239" x2="290" y2="239" />
                <line x1="330" y1="239" x2="470" y2="239" />
                <line x1="510" y1="229" x2="580" y2="139" />
              </svg>

              <div className={`${styles.node} ${styles.nodeOuter} ${styles.nSsl}`} title="SSL & security">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>

              <div className={`${styles.node} ${styles.nWa}`} title="WhatsApp ordering">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3a8 8 0 0 0-6.9 12l-1 4 4.1-1.1A8 8 0 1 0 12 3Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 10c.3 2.2 2 3.9 4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>

              <div className={`${styles.node} ${styles.nCloud}`} title="Hosting">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18a4 4 0 0 1-.4-7.98A5.5 5.5 0 0 1 17.3 9.1 4 4 0 0 1 17 18H7Z" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>

              <div className={`${styles.node} ${styles.nEco}`} title="EcoCash checkout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>

              <div className={`${styles.node} ${styles.nodeOuter} ${styles.nData}`} title="Orders & customer data">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="12" cy="6" rx="7" ry="2.6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5 6v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V6" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5 12v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.infraCaption}>
            SSL · WhatsApp · Hosting · EcoCash · Customer data — all provisioned automatically
          </div>
        </section>

        <section className={styles.stack}>
          <h2>Your app stack, connected</h2>
          <p className={styles.stackIntro}>
            Rivo connects to the tools you already run your business on —
            starting with WhatsApp and EcoCash. No integration code to write
            or maintain.
          </p>

          <div className={styles.stackGrid}>
            <div className={styles.stackFade} aria-hidden="true" />

            <div className={styles.stackRow}>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>Shopify</span>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>Slack</span>
              </div>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>Notion</span>
              </div>
            </div>

            <div className={styles.stackRow}>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 9h16M9 5v14" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>GitHub</span>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.5" y="4.5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3.5 8.5h17" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="7" cy="6.5" r=".8" fill="currentColor" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>Stripe</span>
              </div>
            </div>

            <div className={styles.stackRow}>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>OneMoney</span>
              </div>
              <div className={`${styles.stackTile} ${styles.stackTileHighlight}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 3a8 8 0 0 0-6.9 12l-1 4 4.1-1.1A8 8 0 1 0 12 3Z"
                    stroke="white"
                    strokeWidth="1.7"
                  />
                  <path d="M9 10c.3 2.2 2 3.9 4.2 4.2" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <div className={`${styles.stackTile} ${styles.stackTileHighlight}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.5" y="6" width="17" height="12" rx="2.5" stroke="white" strokeWidth="1.7" />
                  <path d="M3.5 10.5h17" stroke="white" strokeWidth="1.7" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>Paynow</span>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className={styles.stackRow}>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>Sheets</span>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19c3-1 3-11 8-11s5 10 8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className={styles.stackTile}>
                <span className={styles.stackText}>Zapier</span>
              </div>
              <div className={styles.stackTile}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6h11l5 5v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className={styles.stackCaption}>WhatsApp and EcoCash, native — everything else connects around them</div>
        </section>
      </div>
    </div>
  );
}
