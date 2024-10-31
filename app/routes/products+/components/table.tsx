import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { formatRelative } from 'date-fns';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid2,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';

import { useMutationProductsDelete } from '~/services/products';
import { AppButton } from '~/global/components/app-button';
import { ApiProduct } from '~/api-client/types';

interface IProps {
  data: ApiProduct[],
  isLoading?: boolean
}
export const ProductsTable: React.FC<IProps> = ({ data, isLoading }) => {
  const { t } = useTranslation(['products', 'common']);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const deleteItem = useMutationProductsDelete();

  const doDeleteItem = (item: ApiProduct) => {
    if (!window.confirm(t('common:deleteConfirm', { item: item.title.en || item.title.ar }))) return;

    deleteItem.mutate(
      { id: item.productId },
      {
        onSuccess: (result) => {
          if (result?.meta?.message) {
            enqueueSnackbar(result.meta.message, { variant: 'success' as unknown as undefined });
          }
        },
        onError: (err) => {
          enqueueSnackbar(err?.message || 'unknown error', { variant: 'error' as unknown as undefined });
        },
      },
    );
  };

  return (
    <>
      {isMobile ? (
        <Grid2 container spacing={2}>
          {data.map((row) => (
            <Grid2 size={12} key={row.productId}>
              <ProductCard row={row} doDeleteItem={doDeleteItem} />
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('common:title')}</TableCell>
                <TableCell align="right">{t('products:price')}</TableCell>
                <TableCell align="right">{t('common:createdAt')}</TableCell>
                <TableCell align="right" width={150}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <ProductTableRow key={row.productId} row={row} doDeleteItem={doDeleteItem} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

type ProductTableRowProps = { row: ApiProduct; doDeleteItem: (item: ApiProduct) => void };

const ProductTableRow: React.FC<ProductTableRowProps> = ({ row, doDeleteItem }) => {
  const { t } = useTranslation(['products', 'common']);
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell component="th" scope="row">
        <Box>{row.title.en || row.title.ar}</Box>
      </TableCell>
      <TableCell align="right">${row.price?.toLocaleString() || '---'}</TableCell>
      <TableCell align="right">{formatRelative(new Date(row.createdAt), new Date())}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1}>
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

type ProductCardProps = { row: ApiProduct; doDeleteItem: (item: ApiProduct) => void };

const ProductCard: React.FC<ProductCardProps> = ({ row, doDeleteItem }) => {
  const { t } = useTranslation(['products', 'common']);
  return (
    <Card>
      {row.image ? (
        <CardMedia
          component="img"
          height="140"
          image={row.image}
          alt={row.title.en || row.title.ar}
        />
      ) : (
        <Box
          height="140px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="grey.200"
          color="text.secondary"
        >
          <Typography variant="body2">{t('common:noImageAvailable')}</Typography>
        </Box>
      )}
      <CardContent>
        <Typography variant="h6">{row.title.en || row.title.ar}</Typography>
        <Typography variant="body2" color="text.secondary">
          {row.isActive ? t('common:active') : t('common:inactive')}
        </Typography>
        <Typography variant="body1">${row.price?.toLocaleString() || '---'}</Typography>
        {row.priceSale && (
          <Typography variant="body2" color="text.secondary">
            {t('products:priceSale')}: ${row.priceSale.toLocaleString()}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {t('common:createdAt')}: {formatRelative(new Date(row.createdAt), new Date())}
        </Typography>
        {row.updatedAt && row.updatedAt !== row.createdAt && (
          <Typography variant="caption" color="text.secondary">
            {t('common:updatedAt')}: {formatRelative(new Date(row.updatedAt), new Date())}
          </Typography>
        )}
      </CardContent>
      <Stack direction="row" spacing={1} justifyContent="flex-end" p={2}>
        <Button variant="text" onClick={() => doDeleteItem(row)}>
          <DeleteOutline />
        </Button>
        <AppButton to={`/products/${row.productId}`} variant="contained">
          {t('common:edit')}
        </AppButton>
      </Stack>
    </Card>

  );
};
