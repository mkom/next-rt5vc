export async function getServerSideProps() {
  return { redirect: { destination: '/ipl', permanent: true } };
}

export default function DataIpl() {
  return null;
}
