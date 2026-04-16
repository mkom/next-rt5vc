import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../Header';
import BottomNav from '../BottomNav';

const PublicLayout = ({ title, description, children }) => {
  const router = useRouter();

  // Show back button if not on a top-level public page
  const topLevelPaths = ['/', '/ipl', '/confirmation', '/history'];
  const showBack = !topLevelPaths.includes(router.pathname);

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {(title || description) && (
        <Head>
          {title && <title>{title} - RT5VC</title>}
          {description && <meta name="description" content={description} />}
        </Head>
      )}
      
      <Header title={title} showBack={showBack} />
      
      <main className="flex-grow pt-14 pb-20 lg:pb-8">
        <div className="px-4 py-6 lg:max-w-4xl lg:mx-auto lg:px-8">
          {children}
        </div>
      </main>
      
      <BottomNav variant="public" />
    </div>
  );
};

export default PublicLayout;