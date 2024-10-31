import {useTranslation} from 'react-i18next';
import {useSnackbar} from 'notistack';
import {formatRelative} from 'date-fns';

import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {DeleteOutline} from '@mui/icons-material';

import {useMutationProductsDelete} from '~/services/products';

import {AppButton} from '~/global/components/app-button';

import {ApiProduct} from '~/api-client/types';

//
//

export const ProductsTable = ({data}: {data: ApiProduct[]; isLoading: boolean}) => {
  const {t} = useTranslation(['products', 'common']);
  const {enqueueSnackbar} = useSnackbar();
  const deleteItem = useMutationProductsDelete();

  //

  const doDeleteItem = (item: ApiProduct) => {
    if (!window.confirm(t('common:deleteConfirm', {item: item.title.en || item.title.ar}))) return;

    deleteItem.mutate(
      {id: item.productId},
      {
        onSuccess: async result => {
          result?.meta?.message && enqueueSnackbar(result?.meta?.message, {variant: 'success' as unknown as undefined});
        },
        onError: err => {
          enqueueSnackbar(err?.message || 'unknown error', {variant: 'error' as unknown as undefined});
        },
      },
    );
  };

  //
  //

  return (
    <TableContainer component={Paper}>
      <Table sx={{minWidth: 650}}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Box>{t('common:title')}</Box>
              <Typography variant="caption" color="textDisabled">
                {t('products:sku')} | {t('products:quantity')}
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Box>{t('products:price')}</Box>
              <Typography variant="caption" color="textDisabled">
                {t('products:priceSale')}
              </Typography>
            </TableCell>
            <TableCell align="right" width={190}>
              <Box>{t('common:createdAt')}</Box>
              <Typography variant="caption" color="textDisabled">
                {t('common:updatedAt')}
              </Typography>
            </TableCell>
            <TableCell align="right" width={150}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map(row => (
            <ProductTableRow key={row.productId} row={row} doDeleteItem={doDeleteItem} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

//
//

type ProductTableRowProps = {row: ApiProduct; doDeleteItem: (item: ApiProduct) => void};

const ProductTableRow: React.FC<ProductTableRowProps> = ({
  row,
  doDeleteItem,
}: ProductTableRowProps) => {
  const {t} = useTranslation(['products', 'common']);

  return (
    <TableRow sx={{'&:last-child td, &:last-child th': {border: 0}}}>
      <TableCell component="th" scope="row">
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
          }}
        >
          {row.title.en || row.title.ar}
        </Box>
        <Box>
          <Typography variant="caption" color="textDisabled">
            {row.sku || '---'} | {row.quantity || '---'}
          </Typography>
          {row.isActive ? (
            <Typography variant="caption" color="success" ml={1}>
              {t('common:active')}
            </Typography>
          ) : null}
        </Box>
      </TableCell>
      <TableCell align="right">
        <Box>
          <Box>${Number(row.price).toLocaleString() || '---'}</Box>
          <Typography variant="caption" color="textDisabled">
            {row?.priceSale ? '$' + Number(row.priceSale).toLocaleString() : '---'}
          </Typography>
        </Box>
      </TableCell>
      <TableCell align="right">
        <Box>{formatRelative(new Date(row.createdAt), new Date())}</Box>
        <Typography variant="caption" color="textDisabled">
          {row.updatedAt && row.updatedAt !== row.createdAt
            ? formatRelative(new Date(row.updatedAt), new Date())
            : '---'}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Stack spacing={1} direction="row">
          <Button variant="text" onClick={() => doDeleteItem(row)}>
            <DeleteOutline />
          </Button>
          <AppButton to={`/products/${row.productId}`} variant="contained">
            {t('common:edit')}
          </AppButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
};
