import { Template, ITemplate } from '../models/Template.model';
import { TemplateRating, ITemplateRating } from '../models/TemplateRating.model';
import { TemplateShare, ITemplateShare } from '../models/TemplateShare.model';
import { TemplateAnalytics, ITemplateAnalytics } from '../models/TemplateAnalytics.model';
import { AppError } from '../middleware/error.middleware';
import { PageJSON } from '../types/page.types';
import crypto from 'crypto';

export class TemplateService {
  // Get all templates
  async getAllTemplates(category?: string, userId?: string): Promise<ITemplate[]> {
    const filter: any = { isPublic: true };

    if (category) {
      filter.category = category;
    }

    return Template.find(filter).sort({ ratingScore: -1, createdAt: -1 });
  }

  // Get template by ID
  async getTemplateById(templateId: string): Promise<ITemplate> {
    const template = await Template.findById(templateId);

    if (!template) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    return template;
  }

  // Get user's custom templates
  async getUserTemplates(userId: string): Promise<ITemplate[]> {
    return Template.find({ createdBy: userId }).sort({ createdAt: -1 });
  }

  // Create template
  async createTemplate(data: {
    name: string;
    description: string;
    category: string;
    thumbnail: string;
    jsonConfig: PageJSON;
    isPublic: boolean;
    tags?: string[];
    userId?: string;
    isCustom?: boolean;
  }): Promise<ITemplate> {
    const template = await Template.create({
      name: data.name,
      description: data.description,
      category: data.category,
      thumbnail: data.thumbnail,
      jsonConfig: data.jsonConfig,
      isPublic: data.isPublic,
      tags: data.tags || [],
      createdBy: data.userId,
      isCustom: data.isCustom || false,
    });

    return template;
  }

  // Update template
  async updateTemplate(
    templateId: string,
    data: {
      name?: string;
      description?: string;
      thumbnail?: string;
      jsonConfig?: PageJSON;
      isPublic?: boolean;
      tags?: string[];
    }
  ): Promise<ITemplate> {
    const template = await Template.findByIdAndUpdate(
      templateId,
      { $set: data },
      { new: true }
    );

    if (!template) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    return template;
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<void> {
    const template = await Template.findByIdAndDelete(templateId);

    if (!template) {
      throw new AppError('Template not found', 404, 'TEMPLATE_NOT_FOUND');
    }

    // Clean up related data
    await TemplateRating.deleteMany({ templateId });
    await TemplateShare.deleteMany({ templateId });
    await TemplateAnalytics.deleteMany({ templateId });
  }

  // Duplicate/Copy template
  async duplicateTemplate(
    templateId: string,
    userId: string,
    newName: string
  ): Promise<ITemplate> {
    const template = await this.getTemplateById(templateId);

    const duplicated = await Template.create({
      name: newName || `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      thumbnail: template.thumbnail,
      jsonConfig: template.jsonConfig,
      isPublic: false, // Private copy
      tags: template.tags,
      createdBy: userId,
      isCustom: true,
    });

    // Increment duplicate count in analytics
    await this.trackTemplateAction(templateId, 'duplicate');

    return duplicated;
  }

  // Apply template to page (returns jsonConfig)
  async applyTemplate(templateId: string, userId?: string): Promise<PageJSON> {
    const template = await this.getTemplateById(templateId);

    // Track view and use
    if (userId) {
      await this.trackTemplateAction(templateId, 'use');
    } else {
      await this.trackTemplateAction(templateId, 'view');
    }

    return template.jsonConfig;
  }

  // Record template view
  async recordView(templateId: string): Promise<void> {
    await Template.findByIdAndUpdate(
      templateId,
      { $inc: { viewCount: 1 } }
    );
    await this.trackTemplateAction(templateId, 'view');
  }

  // Add/Update rating and review
  async rateTemplate(data: {
    templateId: string;
    userId: string;
    rating: number;
    review?: string;
  }): Promise<ITemplateRating> {
    if (data.rating < 1 || data.rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400, 'INVALID_RATING');
    }

    let templateRating = await TemplateRating.findOne({
      templateId: data.templateId,
      userId: data.userId,
    });

    if (templateRating) {
      // Update existing rating
      templateRating.rating = data.rating;
      if (data.review) {
        templateRating.review = data.review;
      }
      await templateRating.save();
    } else {
      // Create new rating
      templateRating = await TemplateRating.create({
        templateId: data.templateId,
        userId: data.userId,
        rating: data.rating,
        review: data.review || '',
      });
    }

    // Update template rating score
    await this.updateTemplateRatingScore(data.templateId);

    return templateRating;
  }

  // Get template ratings
  async getTemplateRatings(templateId: string): Promise<ITemplateRating[]> {
    return TemplateRating.find({ templateId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
  }

  // Get user's rating for template
  async getUserRating(
    templateId: string,
    userId: string
  ): Promise<ITemplateRating | null> {
    return TemplateRating.findOne({ templateId, userId });
  }

  // Update template rating score
  private async updateTemplateRatingScore(templateId: string): Promise<void> {
    const ratings = await TemplateRating.find({ templateId });

    if (ratings.length === 0) {
      await Template.findByIdAndUpdate(
        templateId,
        { ratingScore: 0, ratingCount: 0 }
      );
      return;
    }

    const avgRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    await Template.findByIdAndUpdate(
      templateId,
      {
        ratingScore: parseFloat(avgRating.toFixed(2)),
        ratingCount: ratings.length,
      }
    );
  }

  // Share template
  async shareTemplate(data: {
    templateId: string;
    ownerId: string;
    sharedWith: string[];
    accessLevel: 'view' | 'use' | 'edit';
    expiresAt?: Date;
  }): Promise<ITemplateShare> {
    const uniqueShareCode = crypto.randomBytes(16).toString('hex');

    const share = await TemplateShare.create({
      templateId: data.templateId,
      ownerId: data.ownerId,
      sharedWith: data.sharedWith,
      accessLevel: data.accessLevel,
      expiresAt: data.expiresAt,
      uniqueShareCode,
    });

    // Increment share count
    await Template.findByIdAndUpdate(
      data.templateId,
      { $inc: { shareCount: data.sharedWith.length } }
    );

    await this.trackTemplateAction(data.templateId, 'share', data.sharedWith.length);

    return share;
  }

  // Get template shares
  async getTemplateShares(templateId: string): Promise<ITemplateShare[]> {
    return TemplateShare.find({ templateId })
      .populate('sharedWith', 'name email')
      .populate('ownerId', 'name email');
  }

  // Get shares for a user
  async getUserShares(userId: string): Promise<ITemplateShare[]> {
    return TemplateShare.find({
      $or: [{ ownerId: userId }, { sharedWith: userId }],
    });
  }

  // Get shared template by share code
  async getSharedTemplate(shareCode: string): Promise<ITemplate | null> {
    const share = await TemplateShare.findOne({ uniqueShareCode: shareCode });

    if (!share) {
      throw new AppError('Share not found', 404, 'SHARE_NOT_FOUND');
    }

    // Check expiration
    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new AppError('Share link expired', 410, 'SHARE_EXPIRED');
    }

    return this.getTemplateById(share.templateId.toString());
  }

  // Track template actions for analytics
  private async trackTemplateAction(
    templateId: string,
    action: 'view' | 'use' | 'share' | 'duplicate',
    count: number = 1
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateData: any = {};
    updateData['$inc'] = {};

    switch (action) {
      case 'view':
        updateData['$inc'].views = count;
        break;
      case 'use':
        updateData['$inc'].uses = count;
        break;
      case 'share':
        updateData['$inc'].shares = count;
        break;
      case 'duplicate':
        updateData['$inc'].duplicateCount = count;
        break;
    }

    await TemplateAnalytics.findOneAndUpdate(
      { templateId, date: today },
      updateData,
      { upsert: true }
    );
  }

  // Get template analytics
  async getTemplateAnalytics(
    templateId: string,
    days: number = 30
  ): Promise<ITemplateAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return TemplateAnalytics.find({
      templateId,
      date: { $gte: startDate },
    }).sort({ date: -1 });
  }

  // Get trending templates
  async getTrendingTemplates(limit: number = 10): Promise<ITemplate[]> {
    return Template.find({ isPublic: true })
      .sort({ viewCount: -1 })
      .limit(limit);
  }

  // Get top-rated templates
  async getTopRatedTemplates(limit: number = 10): Promise<ITemplate[]> {
    return Template.find({ isPublic: true, ratingCount: { $gt: 0 } })
      .sort({ ratingScore: -1 })
      .limit(limit);
  }

  // Search templates
  async searchTemplates(query: string): Promise<ITemplate[]> {
    return Template.find({
      $and: [
        { isPublic: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
          ],
        },
      ],
    }).sort({ ratingScore: -1 });
  }
}

export default new TemplateService();
