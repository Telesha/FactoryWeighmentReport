
import React from 'react';
import PropTypes from 'prop-types';
// material
import { Paper, Typography } from '@material-ui/core';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  searchQuery: PropTypes.string
};

export default function SearchNotFound({ searchQuery = '', ...other }) {
  return (
    <>
      <Typography style={{ marginTop: '100px' }} gutterBottom align="center" variant="subtitle1">
        <b> Not found</b>
      </Typography>
      <Typography style={{ marginBottom: '320px' }} variant="body2" align="center">
        No records to display &nbsp;
        <strong>&quot;{searchQuery}&quot;</strong>.
      </Typography>
    </>
  );
}
