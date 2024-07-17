import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { getPaginationState, JhiItemCount, JhiPagination, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './book-borrow-request.reducer';
import { ActionMenu } from 'app/shared/ui/action-menu';

export const BookBorrowRequest = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const bookBorrowRequestList = useAppSelector(state => state.bookBorrowRequest.entities);
  const loading = useAppSelector(state => state.bookBorrowRequest.loading);
  const totalItems = useAppSelector(state => state.bookBorrowRequest.totalItems);

  const getAllEntities = () => {
    dispatch(
      getEntities({
        page: paginationState.activePage - 1,
        size: paginationState.itemsPerPage,
        sort: `${paginationState.sort},${paginationState.order}`,
      }),
    );
  };

  const sortEntities = () => {
    getAllEntities();
    const endURL = `?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`;
    if (pageLocation.search !== endURL) {
      navigate(`${pageLocation.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    sortEntities();
  }, [paginationState.activePage, paginationState.order, paginationState.sort]);

  useEffect(() => {
    const params = new URLSearchParams(pageLocation.search);
    const page = params.get('page');
    const sort = params.get(SORT);
    if (page && sort) {
      const sortSplit = sort.split(',');
      setPaginationState({
        ...paginationState,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [pageLocation.search]);

  const sort = p => () => {
    setPaginationState({
      ...paginationState,
      order: paginationState.order === ASC ? DESC : ASC,
      sort: p,
    });
  };

  const handlePagination = currentPage =>
    setPaginationState({
      ...paginationState,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    sortEntities();
  };

  const getSortIconByFieldName = (fieldName: string) => {
    const sortFieldName = paginationState.sort;
    const order = paginationState.order;
    if (sortFieldName !== fieldName) {
      return faSort;
    } else {
      return order === ASC ? faSortUp : faSortDown;
    }
  };

  return (
    <div>
      <h2 id="book-borrow-request-heading" data-cy="BookBorrowRequestHeading">
        طلبات استعارة الكتب
        <div className="d-flex justify-content-end">
          {/*<Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>*/}
          {/*  <FontAwesomeIcon icon="sync" spin={loading}/> تحديث*/}
          {/*</Button>*/}
          <Link
            to="/book-borrow-request/new"
            className="btn btn-primary jh-create-entity"
            id="jh-create-entity"
            data-cy="entityCreateButton"
          >
            <FontAwesomeIcon icon="plus" />
            &nbsp; إنشاء طلب استعارة كتاب جديد
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {bookBorrowRequestList && bookBorrowRequestList.length > 0 ? (
          <Table responsive striped>
            <thead>
              <tr>
                <th className="hand" onClick={sort('id')}>
                  الرقم <FontAwesomeIcon icon={getSortIconByFieldName('id')} />
                </th>
                <th className="hand" onClick={sort('requestDate')}>
                  تاريخ الطلب <FontAwesomeIcon icon={getSortIconByFieldName('requestDate')} />
                </th>
                <th className="hand" onClick={sort('collectDate')}>
                  تاريخ الاستلام <FontAwesomeIcon icon={getSortIconByFieldName('collectDate')} />
                </th>
                <th className="hand" onClick={sort('returnDate')}>
                  تاريخ الإرجاع <FontAwesomeIcon icon={getSortIconByFieldName('returnDate')} />
                </th>
                <th className="hand" onClick={sort('bookBorrowRequestStatus')}>
                  حالة طلب استعارة الكتاب <FontAwesomeIcon icon={getSortIconByFieldName('bookBorrowRequestStatus')} />
                </th>
                <th>
                  الكتاب <FontAwesomeIcon icon="sort" />
                </th>
                <th>
                  المستعير <FontAwesomeIcon icon="sort" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bookBorrowRequestList.map((bookBorrowRequest, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/book-borrow-request/${bookBorrowRequest.id}`} color="link" size="sm">
                      {bookBorrowRequest.id}
                    </Button>
                  </td>
                  <td>
                    {bookBorrowRequest.requestDate ? (
                      <TextFormat type="date" value={bookBorrowRequest.requestDate} format={APP_DATE_FORMAT} />
                    ) : null}
                  </td>
                  <td>
                    {bookBorrowRequest.collectDate ? (
                      <TextFormat type="date" value={bookBorrowRequest.collectDate} format={APP_DATE_FORMAT} />
                    ) : null}
                  </td>
                  <td>
                    {bookBorrowRequest.returnDate ? (
                      <TextFormat type="date" value={bookBorrowRequest.returnDate} format={APP_DATE_FORMAT} />
                    ) : null}
                  </td>
                  <td>{bookBorrowRequest.bookBorrowRequestStatus}</td>
                  <td>
                    {bookBorrowRequest.book ? <Link to={`/book/${bookBorrowRequest.book.id}`}>{bookBorrowRequest.book.title}</Link> : ''}
                  </td>
                  <td>
                    {bookBorrowRequest.learner ? (
                      <Link to={`/learner/${bookBorrowRequest.learner.id}`}>{bookBorrowRequest.learner.firstName}</Link>
                    ) : (
                      ''
                    )}
                  </td>
                  <td className="text-start">
                    <ActionMenu route={'book-borrow-request'} item={bookBorrowRequest} paginationState={paginationState} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">لا توجد طلبات استعارة كتب</div>
        )}
      </div>
      {totalItems ? (
        <div className={bookBorrowRequestList && bookBorrowRequestList.length > 0 ? '' : 'd-none'}>
          <div className="justify-content-center d-flex">
            <JhiItemCount page={paginationState.activePage} total={totalItems} itemsPerPage={paginationState.itemsPerPage} />
          </div>
          <div className="justify-content-center d-flex">
            <JhiPagination
              activePage={paginationState.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={paginationState.itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default BookBorrowRequest;
