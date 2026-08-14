import type { RequestHandler } from "express";
import z from "zod";

import Massage from "../models/Massage.js";
import {
    createMassageSchema,
    updateMassageSchema,
} from "../schemas/massage.schemas.js";
import { HttpError } from "../utils/httpError.js";

type CreateMassageBody = z.infer<typeof createMassageSchema>;
type UpdateMassageBody = z.infer<typeof updateMassageSchema>;

// ==============================
// GET ALL ACTIVE MASSAGES
// ==============================

export const getMassages: RequestHandler = async (
    _req,
    res,
    next,
) => {
    try {
        const massages = await Massage.find({
            isActive: true,
        })
        .select(
        "name slug shortDescription illustrationKey",
        )
        .sort({ createdAt: 1 })
        .lean();
        
        res.status(200).json({
            results: massages,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// GET ONE MASSAGE BY SLUG
// ==============================

export const getMassageBySlug: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const slug = req.params.slug;
        
        if (typeof slug !== "string") {
            throw new HttpError(
                400,
                "Invalid massage slug",
            );
        }
        
        const massage = await Massage.findOne({
            slug,
            isActive: true,
        }).lean();
        
        if (!massage) {
            throw new HttpError(
                404,
                "Massage not found",
            );
        }
        
        res.status(200).json(massage);
    } catch (error) {
        next(error);
    }
};

// ==============================
// CREATE MASSAGE
// ==============================

export const createMassage: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const body = req.body as CreateMassageBody;

        const existing = await Massage.findOne({
            slug: body.slug,
        }).lean();
        
        if (existing) {
            throw new HttpError(
                409,
                "Massage with this slug already exists",
            );
        }

        const massage = await Massage.create(body);
        
        res.status(201).json({
            message: "Massage created",
            massage,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// UPDATE MASSAGE
// ==============================

export const updateMassage: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { id } = req.params;
        const body = req.body as UpdateMassageBody;

        const massage = await Massage.findByIdAndUpdate(
            id,
            body,
            {
                // new: true,
                returnDocument: "after",
                runValidators: true,
            },
        );
        
        if (!massage) {
            throw new HttpError(
                404,
                "Massage not found",
            );
        }
        
        res.status(200).json({
            message: "Massage updated",
            massage,
        });
    } catch (error) {
        next(error);
    }
};

// ==============================
// DELETE MASSAGE
// ==============================

export const deleteMassage: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { id } = req.params;

        const massage =
            await Massage.findByIdAndDelete(id);
            
            if (!massage) {
                throw new HttpError(
                    404,
                    "Massage not found",
                );
            }
            
            res.status(200).json({
                message: "Massage deleted",
            });
        } catch (error) {
            next(error);
        }
    };