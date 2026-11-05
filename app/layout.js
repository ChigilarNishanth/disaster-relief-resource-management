export const metadata = {
  title: 'Disaster Relief Resource Management',
  description: 'DBMS Level 3 Project - Logistics Module',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}