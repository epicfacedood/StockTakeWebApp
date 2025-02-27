import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import "./ItemForm.css";

const ItemForm = ({ scannedData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    initWhLane: "",
    itemNo: "",
    expirationDate: null,
    noOfCarton: "",
    looseCartonQuantity: "",
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (scannedData) {
      setFormData({
        ...formData,
        initWhLane: scannedData.initWhLane || "",
      });
    }
  }, [scannedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      expirationDate: date,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting data:", formData);

    // Here you would typically send the data to your backend
    // For now, we'll just show a success message
    setNotification({
      open: true,
      message: "Item data saved successfully!",
      severity: "success",
    });

    // Reset form after submission
    setTimeout(() => {
      setFormData({
        initWhLane: "",
        itemNo: "",
        expirationDate: null,
        noOfCarton: "",
        looseCartonQuantity: "",
      });
      navigate("/");
    }, 2000);
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    });
  };

  const handleScanAgain = () => {
    navigate("/");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="form-container">
        <Paper elevation={3} className="form-paper">
          <Typography variant="h5" gutterBottom>
            Item Details
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Init WH Lane"
                  name="initWhLane"
                  value={formData.initWhLane}
                  onChange={handleChange}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleScanAgain}>
                          <QrCodeScannerIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Item No."
                  name="itemNo"
                  value={formData.itemNo}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="Expiration Date"
                  value={formData.expirationDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="No. of Carton"
                  name="noOfCarton"
                  type="number"
                  value={formData.noOfCarton}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Loose Carton Quantity"
                  name="looseCartonQuantity"
                  type="number"
                  value={formData.looseCartonQuantity}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Box className="form-buttons">
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    className="submit-btn"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleScanAgain}
                    className="scan-again-btn"
                  >
                    Scan Again
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default ItemForm;
