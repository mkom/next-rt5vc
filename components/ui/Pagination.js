import ReactPaginate from 'react-paginate';

const Pagination = ({ pageCount, currentPage, onPageChange }) => {
  if (pageCount <= 1) return null;

  return (
    <div className="py-6">
      <ReactPaginate
        previousLabel="«"
        nextLabel="»"
        breakLabel="..."
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={({ selected }) => onPageChange(selected)}
        forcePage={currentPage}
        containerClassName="join flex justify-center"
        pageClassName="join-item"
        pageLinkClassName="join-item btn btn-sm"
        previousLinkClassName="join-item btn btn-sm"
        nextLinkClassName="join-item btn btn-sm"
        breakLinkClassName="join-item btn btn-sm btn-disabled"
        activeLinkClassName="btn-active"
      />
    </div>
  );
};

export default Pagination;
