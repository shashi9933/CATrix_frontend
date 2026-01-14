import { useEffect, useState } from 'react';
import { collegeAPI } from '../utils/api';
import {
  Box,
  Typography,
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Stack,
  Container,
  Chip
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const Colleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Predictor State
  const [percentile, setPercentile] = useState<number>(90);
  const [category, setCategory] = useState('General');
  const [gender, setGender] = useState('Male');
  const [workEx, setWorkEx] = useState('');

  useEffect(() => {
    setLoading(true);
    collegeAPI.getAll()
      .then((response: any) => {
        setColleges(response.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load colleges", err);
        setLoading(false);
      });
  }, []);

  // Filter Logic: Search + Percentile Cutoff
  const filteredColleges = colleges.filter((college: any) => {
    const matchesSearch = college.name.toLowerCase().includes(search.toLowerCase());

    // Check cutoff based on category
    let cutoff = 0;
    if (college.cutoff && typeof college.cutoff === 'object') {
      if (category === 'OBC') cutoff = college.cutoff.obc || college.cutoff.general;
      else if (category === 'SC') cutoff = college.cutoff.sc || college.cutoff.general;
      else if (category === 'ST') cutoff = college.cutoff.st || college.cutoff.general;
      else cutoff = college.cutoff.general;
    } else {
      cutoff = college.cutoff || 0;
    }

    const matchesCutoff = cutoff <= (percentile + 5);
    return matchesSearch && matchesCutoff;
  });

  const tableHeaderStyle = {
    backgroundColor: '#1a1a1a',
    color: '#9e9e9e',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    padding: '16px 24px',
  };

  const tableCellStyle = {
    color: '#e0e0e0',
    padding: '16px 24px',
    borderBottom: '1px solid #404040',
  };

  return (
    <Container maxWidth="xl" sx={{ pb: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          FIND YOUR DREAM B-SCHOOL
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Predict your chances based on your profile and CAT score
        </Typography>
      </Box>

      {/* PREDICTOR SECTION */}
      <Card sx={{
        p: 4,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        mb: 4
      }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2d3436', mb: 3 }}>
          LET'S PREDICT YOUR MBA COLLEGE
        </Typography>

        <Grid container spacing={4}>
          {/* Personal Info */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="OBC">OBC</MenuItem>
                <MenuItem value="SC">SC</MenuItem>
                <MenuItem value="ST">ST</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select value={gender} label="Gender" onChange={(e) => setGender(e.target.value)}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Work Experience (Months)" type="number" size="small" fullWidth value={workEx} onChange={(e) => setWorkEx(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Graduation %" type="number" size="small" fullWidth />
          </Grid>

          {/* Percentile Slider */}
          <Grid item xs={12}>
            <Box sx={{ px: 2, py: 1, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Expected CAT Percentile: {percentile}%
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2">50%</Typography>
                <Slider
                  value={percentile}
                  onChange={(_, val) => setPercentile(val as number)}
                  min={50}
                  max={100}
                  step={0.1}
                  valueLabelDisplay="auto"
                  sx={{ height: 8 }}
                />
                <Typography variant="body2">100%</Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* SEARCH & RESULTS */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#2d3436' }}>
          Top B-Schools ({filteredColleges.length})
        </Typography>
        <TextField
          placeholder="Search B-School..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            sx: { borderRadius: '20px', backgroundColor: 'white' }
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{
        borderRadius: '16px',
        bgcolor: '#1a1a1a',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderStyle}>#</TableCell>
              <TableCell sx={tableHeaderStyle}>B-School</TableCell>
              <TableCell sx={tableHeaderStyle}>Highest Package</TableCell>
              <TableCell sx={tableHeaderStyle}>Average Package</TableCell>
              <TableCell sx={tableHeaderStyle}>Exam</TableCell>
              <TableCell sx={tableHeaderStyle}>Cutoff ({category})</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'white' }}>Loading...</TableCell>
              </TableRow>
            ) : filteredColleges.map((college: any, index: number) => {
              const placement = college.placements || {};
              const cutoffObj = college.cutoff || {};
              const displayCutoff = category === 'General' ? cutoffObj.general : (cutoffObj[category.toLowerCase()] || cutoffObj.general);

              return (
                <TableRow key={college.id} sx={{
                  '&:nth-of-type(odd)': { bgcolor: '#2d2d2d' },
                  '&:nth-of-type(even)': { bgcolor: '#252525' },
                  '&:hover': { bgcolor: '#333' }
                }}>
                  <TableCell sx={tableCellStyle}>{college.rankIndia || index + 1}</TableCell>
                  <TableCell sx={{ ...tableCellStyle, fontWeight: 600, color: '#fff' }}>
                    {college.name}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {college.location}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableCellStyle}>{placement.highestCTC ? `₹${placement.highestCTC} LPA` : 'N/A'}</TableCell>
                  <TableCell sx={{ ...tableCellStyle, color: '#4caf50', fontWeight: 600 }}>
                    {placement.averageCTC ? `₹${placement.averageCTC} LPA` : 'N/A'}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Chip label="CAT" size="small" sx={{ backgroundColor: '#2d2d2d', color: '#fff', border: '1px solid #555' }} />
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: percentile >= displayCutoff ? '#4caf50' : '#f44336',
                          mr: 1
                        }}
                      />
                      {displayCutoff}%
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && filteredColleges.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'white' }}>No colleges found matching criteria</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Colleges;