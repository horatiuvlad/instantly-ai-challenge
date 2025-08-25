import '@/styles/globals.css';
import Head from 'next/head';
import Link from 'next/link';
import EmailIcon from '@mui/icons-material/Email';
import { AccountBox } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '@/theme';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Head>
        <title>Instantly.AI Email App</title>
        <meta name="description" content="AI-powered email management app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="sidebar">
        <Link href="/">
          <EmailIcon />
        </Link>
        <Link href="/leads">
          <AccountBox />
        </Link>
      </div>
      <main>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
}
