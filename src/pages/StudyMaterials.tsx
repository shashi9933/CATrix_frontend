import { useEffect, useState } from 'react';
import { studyMaterialAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Description as PDFIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  StarBorder as StarIcon,
  Star as StarredIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface StudyMaterialType {
  id: string;
  title: string;
  section: string;
  topic: string;
  content: string;
  description?: string;
  fileUrl?: string;
  difficulty?: string;
  createdAt: string;
  isSaved?: boolean;
  isMarked?: boolean;
}

const SECTIONS = ['VARC', 'DILR', 'QA'];

const TOPICS_BY_SECTION: Record<string, string[]> = {
  VARC: ['Reading Comprehension', 'Grammar', 'Vocabulary', 'Critical Reasoning'],
  DILR: ['Logical Reasoning', 'Data Interpretation', 'Set Theory', 'Analytical Puzzles'],
  QA: ['Arithmetic', 'Algebra', 'Geometry', 'Statistics', 'Number Theory'],
};

const StudyMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterialType[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterialType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  // Filter states
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [showMarkedOnly, setShowMarkedOnly] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    section: '',
    topic: '',
    content: '',
    description: '',
    difficulty: 'medium',
    fileUrl: '',
  });

  // Load materials
  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studyMaterialAPI.getAll();
      setMaterials(response.data);
    } catch (err) {
      setError('Failed to load study materials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = materials;

    if (selectedSection) {
      filtered = filtered.filter(m => m.section === selectedSection);
    }

    if (selectedTopic) {
      filtered = filtered.filter(m => m.topic === selectedTopic);
    }

    if (showSavedOnly) {
      filtered = filtered.filter(m => m.isSaved);
    }

    if (showMarkedOnly) {
      filtered = filtered.filter(m => m.isMarked);
    }

    setFilteredMaterials(filtered);
  }, [materials, selectedSection, selectedTopic, showSavedOnly, showMarkedOnly]);

  const handleCreateMaterial = async () => {
    try {
      if (!formData.title || !formData.section || !formData.topic) {
        setError('Title, section, and topic are required');
        return;
      }

      setLoading(true);
      const response = await studyMaterialAPI.create(formData);
      setMaterials([response.data, ...materials]);
      setSuccess('Study material created successfully!');
      setOpenDialog(false);
      setFormData({
        title: '',
        section: '',
        topic: '',
        content: '',
        description: '',
        difficulty: 'medium',
        fileUrl: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create study material');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMaterial = async (id: string, isSaved: boolean) => {
    try {
      if (isSaved) {
        await studyMaterialAPI.unsaveMaterial(id);
      } else {
        await studyMaterialAPI.saveMaterial(id);
      }
      
      const updated = materials.map(m =>
        m.id === id ? { ...m, isSaved: !isSaved } : m
      );
      setMaterials(updated);
      setSuccess(isSaved ? 'Removed from saved' : 'Added to saved');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to save material');
      console.error(err);
    }
  };

  const handleMarkMaterial = async (id: string, isMarked: boolean) => {
    try {
      await studyMaterialAPI.markMaterial(id, !isMarked);
      
      const updated = materials.map(m =>
        m.id === id ? { ...m, isMarked: !isMarked } : m
      );
      setMaterials(updated);
      setSuccess(isMarked ? 'Unmarked' : 'Marked');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to mark material');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Study Materials
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Access comprehensive study materials for CAT preparation
          </Typography>
        </Box>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Material
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value);
                  setSelectedTopic('');
                }}
                label="Section"
              >
                <MenuItem value="">All Sections</MenuItem>
                {SECTIONS.map(section => (
                  <MenuItem key={section} value={section}>{section}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth disabled={!selectedSection}>
              <InputLabel>Topic</InputLabel>
              <Select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                label="Topic"
              >
                <MenuItem value="">All Topics</MenuItem>
                {selectedSection && TOPICS_BY_SECTION[selectedSection]?.map(topic => (
                  <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant={showSavedOnly ? 'contained' : 'outlined'}
              startIcon={showSavedOnly ? <BookmarkedIcon /> : <BookmarkIcon />}
              onClick={() => setShowSavedOnly(!showSavedOnly)}
            >
              {showSavedOnly ? 'Saved' : 'View Saved'}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant={showMarkedOnly ? 'contained' : 'outlined'}
              startIcon={showMarkedOnly ? <StarredIcon /> : <StarIcon />}
              onClick={() => setShowMarkedOnly(!showMarkedOnly)}
            >
              {showMarkedOnly ? 'Marked' : 'View Marked'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Materials List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredMaterials.length === 0 ? (
        <Alert severity="info">No study materials found. {user?.role === 'admin' && 'Click "Add Material" to create one.'}</Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredMaterials.map(material => (
            <Grid item xs={12} md={6} key={material.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>{material.title}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={material.section} size="small" color="primary" variant="outlined" />
                        <Chip label={material.topic} size="small" variant="outlined" />
                        {material.difficulty && (
                          <Chip 
                            label={material.difficulty} 
                            size="small" 
                            color={material.difficulty === 'easy' ? 'success' : material.difficulty === 'medium' ? 'warning' : 'error'}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={material.isSaved ? 'Remove from saved' : 'Save'}>
                        <IconButton
                          size="small"
                          onClick={() => handleSaveMaterial(material.id, material.isSaved || false)}
                        >
                          {material.isSaved ? <BookmarkedIcon /> : <BookmarkIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={material.isMarked ? 'Unmark' : 'Mark'}>
                        <IconButton
                          size="small"
                          onClick={() => handleMarkMaterial(material.id, material.isMarked || false)}
                        >
                          {material.isMarked ? <StarredIcon /> : <StarIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {material.description && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {material.description}
                    </Typography>
                  )}

                  <Typography variant="body2" sx={{ mb: 2, maxHeight: 100, overflow: 'auto' }}>
                    {material.content}
                  </Typography>
                </CardContent>

                {material.fileUrl && (
                  <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener"
                      startIcon={<PDFIcon />}
                    >
                      Download File
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Material Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Add Study Material
            <IconButton size="small" onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="dense"
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Section</InputLabel>
            <Select
              value={formData.section}
              onChange={(e) => {
                setFormData({ ...formData, section: e.target.value, topic: '' });
              }}
              label="Section"
            >
              {SECTIONS.map(section => (
                <MenuItem key={section} value={section}>{section}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" disabled={!formData.section}>
            <InputLabel>Topic</InputLabel>
            <Select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              label="Topic"
            >
              {formData.section && TOPICS_BY_SECTION[formData.section]?.map(topic => (
                <MenuItem key={topic} value={topic}>{topic}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="dense"
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            margin="dense"
            multiline
            rows={4}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              label="Difficulty"
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="File URL (optional)"
            value={formData.fileUrl}
            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            margin="dense"
            placeholder="https://example.com/file.pdf"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateMaterial} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudyMaterials; 