import PublicLayout from '../components/layouts/PublicLayout';
import Form from '../components/FormConfirmation.js';

const FormConfirm = () => {
  return (
    <>
      <h1 className='text-xl mb-4 font-bold'>Konfirmasi Transfer IPL</h1>
      <Form/>
    </>
  );
};

FormConfirm.getLayout = (page) => (
  <PublicLayout title="Konfirmasi Transfer IPL" description="Konfirmasi Transfer IPL RT05/RW11 Villa Citayam Susukan Bojong gede Bogor">
    {page}
  </PublicLayout>
);

export default FormConfirm;
