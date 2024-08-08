import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {
  AppBar,
  Badge,
  Box,
  Hidden,
  IconButton,
  Toolbar,
  Button,
  makeStyles,
  Avatar,
  Typography,
  withStyles,
  Tooltip
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import Logo from 'src/components/Logo';
import Popover from '@material-ui/core/Popover';
import tokenService from '../../utils/tokenDecoder';
import { Offline, Online, Detector } from "react-detect-offline"
import WifiIcon from '@material-ui/icons/Wifi';

const useStyles = makeStyles(() => ({
  root: {
    background: '#ffffff'
  },
  avatar: {
    width: 50,
    height: 50
  }
}));

const NameTextTypography = withStyles({
  root: {
    color: "#5D605F"
  }
})(Typography);

const CaptionTextTypography = withStyles({
  root: {
    color: "#0308AB"
  }
})(Typography);

// const user = {
//   avatar: '/static/images/avatars/avatar_6.png',
//   jobTitle: tokenService.getRoleNameFromToken(),
//   name: tokenService.getUserNameFromToken()
// };

const TopBar = ({
  className,
  onMobileNavOpen,
  ...rest
}) => {
  const classes = useStyles();
  const [notifications] = useState([]);

  const [userName, setUserName] = useState()
  const [roleName, setRoleName] = useState()

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const navigate = useNavigate();

  const logout = async (values) => {
    sessionStorage.removeItem('token');
    navigate('/login');
  };


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePasswordChange = (event) => {
    let encryptedUserID = btoa(tokenService.getUserIDFromToken().toString())
    navigate("/app/users/changeUserPassword/" + encryptedUserID)
  }

  useEffect(() => {
    setUserName(tokenService.getUserNameFromToken())
    setRoleName(tokenService.getRoleNameFromToken())
  }, []);

  const user = {
    //avatar: '/static/images/not_found.png',
    jobTitle: roleName,
    name: userName
  };

  return (
    <AppBar
      className={clsx(classes.root, className)}
      elevation={0}
      {...rest}
    >
      <Toolbar>

        <Hidden mdDown>
          <RouterLink to="/">
            <Logo />
          </RouterLink>
          <Box flexGrow={1} />

          <Box paddingRight="20px">
            <Detector
              render={({ online }) => (
                online ?
                  <WifiIcon style={{
                    color: "green"
                  }} /> : <WifiIcon style={{
                    color: "#FF9B86"
                  }} />
              )}
            />

          </Box>

          <Box
            paddingRight="10px">
            <NameTextTypography
              color="primary"
              variant="h6"  >
              {user.name}
            </NameTextTypography >
            <CaptionTextTypography

              variant="caption" >
              {user.jobTitle}
            </CaptionTextTypography>
          </Box>
          <Box>
            <Avatar
              className={classes.avatar}
              // component={RouterLink}
              src={user.avatar}
              // to="/app/dashboard"
              style={{ cursor: 'pointer' }}
              onClick={handleClick}
            />
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Button color="primary" onClick={handlePasswordChange}>Change Password</Button>
            </Popover>
          </Box>
          <IconButton >
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Tooltip title="Sign out">
            <IconButton >
              <InputIcon
                onClick={logout}
              />
            </IconButton>
          </Tooltip>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            color="primary"
            onClick={onMobileNavOpen} >
            <MenuIcon />
          </IconButton>
          <Box flexGrow={1} />
          <Box
            paddingRight="5px">
            <NameTextTypography
              variant="h6" >
              {user.name}
            </NameTextTypography>

          </Box>
          <Box>
            <Avatar
              className={classes.avatar}
              component={RouterLink}
              src={user.avatar}
              to="/app/account"
            />
          </Box>
          <IconButton color="inherit">
            <InputIcon
              onClick={logout}
            />
          </IconButton>

        </Hidden>
      </Toolbar>
    </AppBar>
  );
};

TopBar.propTypes = {
  className: PropTypes.string,
  onMobileNavOpen: PropTypes.func
};

export default TopBar;
