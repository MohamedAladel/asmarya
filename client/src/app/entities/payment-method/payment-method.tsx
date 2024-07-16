import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'reactstrap';
import { byteSize, getPaginationState, JhiItemCount, JhiPagination, openFile } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntities } from './payment-method.reducer';

export const PaymentMethod = () => {
  const dispatch = useAppDispatch();

  const pageLocation = useLocation();
  const navigate = useNavigate();

  const [paginationState, setPaginationState] = useState(
    overridePaginationStateWithQueryParams(getPaginationState(pageLocation, ITEMS_PER_PAGE, 'id'), pageLocation.search),
  );

  const paymentMethodList = useAppSelector(state => state.paymentMethod.entities);
  const loading = useAppSelector(state => state.paymentMethod.loading);
  const totalItems = useAppSelector(state => state.paymentMethod.totalItems);

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
      <h2 id="payment-method-heading" data-cy="PaymentMethodHeading">
        Payment Methods
        <div className="d-flex justify-content-end">
          <Button className="me-2" color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> نحديث
          </Button>
          <Link to="/payment-method/new" className="btn btn-primary jh-create-entity" id="jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" />
            &nbsp; Create a new Payment Method
          </Link>
        </div>
      </h2>
      <div className="table-responsive">
        {paymentMethodList && paymentMethodList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th className="hand" onClick={sort('id')}>
                  ID <FontAwesomeIcon icon={getSortIconByFieldName('id')} />
                </th>
                <th className="hand" onClick={sort('nameAr')}>
                  Name Ar <FontAwesomeIcon icon={getSortIconByFieldName('nameAr')} />
                </th>
                <th className="hand" onClick={sort('nameEn')}>
                  Name En <FontAwesomeIcon icon={getSortIconByFieldName('nameEn')} />
                </th>
                <th className="hand" onClick={sort('menuOrder')}>
                  Menu Order <FontAwesomeIcon icon={getSortIconByFieldName('menuOrder')} />
                </th>
                <th className="hand" onClick={sort('imageFileUrl')}>
                  Image File Url <FontAwesomeIcon icon={getSortIconByFieldName('imageFileUrl')} />
                </th>
                <th className="hand" onClick={sort('imageFile')}>
                  Image File <FontAwesomeIcon icon={getSortIconByFieldName('imageFile')} />
                </th>
                <th className="hand" onClick={sort('details')}>
                  Details <FontAwesomeIcon icon={getSortIconByFieldName('details')} />
                </th>
                <th className="hand" onClick={sort('feePercentage')}>
                  Fee Percentage <FontAwesomeIcon icon={getSortIconByFieldName('feePercentage')} />
                </th>
                <th className="hand" onClick={sort('paymentType')}>
                  Payment Type <FontAwesomeIcon icon={getSortIconByFieldName('paymentType')} />
                </th>
                <th className="hand" onClick={sort('isActive')}>
                  Is Active <FontAwesomeIcon icon={getSortIconByFieldName('isActive')} />
                </th>
                <th className="hand" onClick={sort('notes')}>
                  Notes <FontAwesomeIcon icon={getSortIconByFieldName('notes')} />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paymentMethodList.map((paymentMethod, i) => (
                <tr key={`entity-${i}`} data-cy="entityTable">
                  <td>
                    <Button tag={Link} to={`/payment-method/${paymentMethod.id}`} color="link" size="sm">
                      {paymentMethod.id}
                    </Button>
                  </td>
                  <td>{paymentMethod.nameAr}</td>
                  <td>{paymentMethod.nameEn}</td>
                  <td>{paymentMethod.menuOrder}</td>
                  <td>{paymentMethod.imageFileUrl}</td>
                  <td>
                    {paymentMethod.imageFile ? (
                      <div>
                        {paymentMethod.imageFileContentType ? (
                          <a onClick={openFile(paymentMethod.imageFileContentType, paymentMethod.imageFile)}>
                            <img
                              src={`data:${paymentMethod.imageFileContentType};base64,${paymentMethod.imageFile}`}
                              style={{ maxHeight: '30px' }}
                            />
                            &nbsp;
                          </a>
                        ) : null}
                        <span>
                          {paymentMethod.imageFileContentType}, {byteSize(paymentMethod.imageFile)}
                        </span>
                      </div>
                    ) : null}
                  </td>
                  <td>{paymentMethod.details}</td>
                  <td>{paymentMethod.feePercentage}</td>
                  <td>{paymentMethod.paymentType}</td>
                  <td>{paymentMethod.isActive ? 'true' : 'false'}</td>
                  <td>{paymentMethod.notes}</td>
                  <td className="text-end">
                    <div className="btn-group flex-btn-group-container">
                      <Button tag={Link} to={`/payment-method/${paymentMethod.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                        <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">عرض</span>
                      </Button>
                      <Button
                        tag={Link}
                        to={`/payment-method/${paymentMethod.id}/edit?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`}
                        color="primary"
                        size="sm"
                        data-cy="entityEditButton"
                      >
                        <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">تعديل</span>
                      </Button>
                      <Button
                        onClick={() =>
                          (window.location.href = `/payment-method/${paymentMethod.id}/delete?page=${paginationState.activePage}&sort=${paginationState.sort},${paginationState.order}`)
                        }
                        color="danger"
                        size="sm"
                        data-cy="entityDeleteButton"
                      >
                        <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">حذف</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !loading && <div className="alert alert-warning">No Payment Methods found</div>
        )}
      </div>
      {totalItems ? (
        <div className={paymentMethodList && paymentMethodList.length > 0 ? '' : 'd-none'}>
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

export default PaymentMethod;
