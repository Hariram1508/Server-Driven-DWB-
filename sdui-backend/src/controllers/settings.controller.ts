import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { sendError, sendSuccess } from "../utils/response.util";
import { Institution, IInstitution } from "../models/Institution.model";

type SettingsPayload = Partial<IInstitution["settings"]>;

const mergeSettings = (
  currentSettings: IInstitution["settings"],
  incoming: SettingsPayload,
): IInstitution["settings"] => {
  return {
    ...currentSettings,
    ...incoming,
    colors: {
      ...currentSettings.colors,
      ...(incoming.colors || {}),
    },
    fonts: {
      ...currentSettings.fonts,
      ...(incoming.fonts || {}),
    },
    social: {
      ...(currentSettings.social || {}),
      ...(incoming.social || {}),
    },
    analytics: {
      ...(currentSettings.analytics || {}),
      ...(incoming.analytics || {}),
    },
    customDomain: {
      ...(currentSettings.customDomain || {}),
      ...(incoming.customDomain || {}),
    },
    email: {
      ...(currentSettings.email || {}),
      ...(incoming.email || {}),
    },
  };
};

class SettingsController {
  getSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
    }

    const institution = await Institution.findById(req.user.institutionId)
      .select("name subdomain settings")
      .lean();

    if (!institution) {
      return sendError(
        res,
        "Institution not found",
        404,
        "INSTITUTION_NOT_FOUND",
      );
    }

    return sendSuccess(res, institution);
  });

  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
    }

    const incoming = (req.body.settings || {}) as SettingsPayload;

    const institution = await Institution.findById(req.user.institutionId);

    if (!institution) {
      return sendError(
        res,
        "Institution not found",
        404,
        "INSTITUTION_NOT_FOUND",
      );
    }

    institution.settings = mergeSettings(institution.settings, incoming);
    await institution.save();

    return sendSuccess(
      res,
      {
        id: institution._id,
        name: institution.name,
        subdomain: institution.subdomain,
        settings: institution.settings,
      },
      "Settings saved successfully",
    );
  });

  getPublicSettings = asyncHandler(async (req: Request, res: Response) => {
    const institutionId =
      (req.query.institutionId as string | undefined) ||
      (req.headers["x-institution-id"] as string | undefined);

    if (!institutionId) {
      return sendError(
        res,
        "institutionId is required",
        400,
        "INSTITUTION_ID_REQUIRED",
      );
    }

    const institution = await Institution.findById(institutionId)
      .select("name subdomain domain settings")
      .lean();

    if (!institution) {
      return sendError(
        res,
        "Institution not found",
        404,
        "INSTITUTION_NOT_FOUND",
      );
    }

    const settings = institution.settings || ({} as IInstitution["settings"]);

    return sendSuccess(res, {
      institutionId: institution._id,
      name: institution.name,
      subdomain: institution.subdomain,
      customDomain: institution.domain || settings.customDomain?.domain || "",
      settings: {
        siteName: settings.siteName || institution.name,
        tagline: settings.tagline || "",
        logo: settings.logo || "",
        favicon: settings.favicon || "",
        colors: settings.colors,
        fonts: settings.fonts,
        social: settings.social || {},
        analytics: settings.analytics || {},
        customDomain: settings.customDomain || {},
      },
    });
  });
}

export default new SettingsController();
