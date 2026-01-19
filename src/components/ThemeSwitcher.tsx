import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, ListItemIcon, ListItemText } from '@mui/material';
import { useThemeContext } from '../contexts/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ForestIcon from '@mui/icons-material/Forest';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import NightsStayIcon from '@mui/icons-material/NightsStay';

export const ThemeSwitcher = () => {
    const { currentTheme, setTheme } = useThemeContext();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleThemeChange = (themeName: 'white' | 'aeon' | 'eco' | 'newDark' | 'neon') => {
        setTheme(themeName);
        handleClose();
    };

    const getIcon = () => {
        switch (currentTheme) {
            case 'aeon': return <LightModeIcon />;
            case 'eco': return <ForestIcon />;
            case 'neon': return <TipsAndUpdatesIcon />;
            case 'newDark': return <NightsStayIcon />;
            default: return <DarkModeIcon />; // White theme icon
        }
    };

    return (
        <>
            <Tooltip title="Change Theme">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'theme-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    color="inherit"
                >
                    {getIcon()}
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                id="theme-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.4))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => handleThemeChange('white')} selected={currentTheme === 'white'}>
                    <ListItemIcon>
                        <DarkModeIcon fontSize="small" sx={{ color: '#6C63FF' }} />
                    </ListItemIcon>
                    <ListItemText>Classic White</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange('newDark')} selected={currentTheme === 'newDark'}>
                    <ListItemIcon>
                        <NightsStayIcon fontSize="small" sx={{ color: '#3B82F6' }} />
                    </ListItemIcon>
                    <ListItemText>Dark Mode</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange('neon')} selected={currentTheme === 'neon'}>
                    <ListItemIcon>
                        <TipsAndUpdatesIcon fontSize="small" sx={{ color: '#06B6D4' }} />
                    </ListItemIcon>
                    <ListItemText>Neon</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange('aeon')} selected={currentTheme === 'aeon'}>
                    <ListItemIcon>
                        <LightModeIcon fontSize="small" sx={{ color: '#8B5CF6' }} />
                    </ListItemIcon>
                    <ListItemText>Aeon Glass</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleThemeChange('eco')} selected={currentTheme === 'eco'}>
                    <ListItemIcon>
                        <ForestIcon fontSize="small" sx={{ color: '#4ADE80' }} />
                    </ListItemIcon>
                    <ListItemText>Eco Study</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};
