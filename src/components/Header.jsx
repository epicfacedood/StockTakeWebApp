import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" className="header">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="home"
          onClick={() => navigate("/")}
        >
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" component="div" className="header-title">
          StockTake App
        </Typography>
        <Box flexGrow={1} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
