import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  colors,
  ListItemAvatar,
  ListItemText,
  makeStyles
} from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/PeopleOutlined';
import tokenService from '../../../utils/tokenDecoder';
import { trackPromise } from 'react-promise-tracker';
import services from '../Services';

const useStyles = makeStyles(({
  root: {
    height: '100%'
  },
  image: {
    height: 48,
    width: 48
  },
  avatar: {
    backgroundColor: colors.grey[100],
    height: 56,
    width: 56,
    marginRight:10
  },
}));

const LatestProducts = ({ className, ...rest }) => {
  const classes = useStyles();
  const [loanDetails, setLoanDetails] = useState([]);

  useEffect(() => {
    trackPromise(GetDetails());
  }, []);


  async function GetDetails() {
    let model = {
      groupID: parseInt(tokenService.getGroupIDFromToken()),
      factoryID: parseInt(tokenService.getFactoryIDFromToken())
    }
    const customerData = await services.GetLatestLoanDetailsforDashboard(model);
    setLoanDetails(customerData.data);
  }


  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader
        title="Latest Loans"
      />
      <Divider />
      <List>
        {loanDetails.map((loanDetails, i) => (
          <ListItem
            divider={i < loanDetails.length - 1}
            key={loanDetails.customerID}
          >
            <ListItemAvatar>
              {/* <img
                alt="Product"
                className={classes.image}
                src="/static/images/products/product_7.png"
              /> */}
              <IconButton className={classes.avatar}
              edge="end"
              size="large"
              color="primary"
            >
              <PeopleIcon />
            </IconButton>
            </ListItemAvatar>
            <ListItemText
              primary={loanDetails.name}
              secondary={loanDetails.principalAmount.toFixed(2)}
            />
            <IconButton
              edge="end"
              size="small"
            >
              {/* <MoreVertIcon /> */}
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* <Box
        display="flex"
        justifyContent="flex-end"
        p={2}
      >
        <Button
          color="primary"
          endIcon={<ArrowRightIcon />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </Box> */}
    </Card>
  );
};

LatestProducts.propTypes = {
  className: PropTypes.string
};

export default LatestProducts;
