import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGalleryItemSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set up multer storage for file uploads
const storage_dir = path.join(process.cwd(), 'gallery_uploads');
// Create storage directory if it doesn't exist
if (!fs.existsSync(storage_dir)) {
  fs.mkdirSync(storage_dir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storage_dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: fileStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    const filetypes = /jpeg|jpg|png|gif|mp4|webm|ogg/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports images and videos!"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Gallery routes
  app.get('/api/gallery', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const items = await storage.getGalleryItems(limit, offset);
      res.json(items);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      res.status(500).json({ error: 'Failed to retrieve gallery items' });
    }
  });
  
  app.get('/api/gallery/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const item = await storage.getGalleryItemById(id);
      if (!item) {
        return res.status(404).json({ error: 'Gallery item not found' });
      }
      
      res.json(item);
    } catch (error) {
      console.error('Error fetching gallery item:', error);
      res.status(500).json({ error: 'Failed to retrieve gallery item' });
    }
  });
  
  app.get('/api/gallery/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const items = await storage.searchGalleryItems(query);
      res.json(items);
    } catch (error) {
      console.error('Error searching gallery items:', error);
      res.status(500).json({ error: 'Failed to search gallery items' });
    }
  });
  
  app.get('/api/gallery/tags', async (req: Request, res: Response) => {
    try {
      const tags = (req.query.tags as string).split(',');
      if (!tags || tags.length === 0) {
        return res.status(400).json({ error: 'At least one tag is required' });
      }
      
      const items = await storage.searchGalleryItemsByTags(tags);
      res.json(items);
    } catch (error) {
      console.error('Error searching gallery items by tags:', error);
      res.status(500).json({ error: 'Failed to search gallery items by tags' });
    }
  });
  
  // Upload a new gallery item
  app.post('/api/gallery', upload.single('media'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Validate body using zod schema
      const validationResult = insertGalleryItemSchema.safeParse({
        title: req.body.title,
        description: req.body.description,
        mediaUrl: `/gallery_uploads/${req.file.filename}`,
        thumbnailUrl: req.body.thumbnailUrl || null,
        mediaType: req.file.mimetype.startsWith('image') ? 'image' : 'video',
        tags: req.body.tags ? req.body.tags.split(',') : [],
        metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {}
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid gallery item data',
          details: validationResult.error.errors
        });
      }
      
      const galleryItem = await storage.createGalleryItem(validationResult.data);
      
      // Link to user if userId is provided
      if (req.body.userId) {
        const userId = parseInt(req.body.userId);
        await storage.linkGalleryItemToUser(userId, galleryItem.id);
      }
      
      res.status(201).json(galleryItem);
    } catch (error) {
      console.error('Error creating gallery item:', error);
      res.status(500).json({ error: 'Failed to create gallery item' });
    }
  });

  // Static file serving for gallery uploads
  app.use('/gallery_uploads', (req, res, next) => {
    // Add cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    next();
  }, express.static(storage_dir));

  const httpServer = createServer(app);

  return httpServer;
}
