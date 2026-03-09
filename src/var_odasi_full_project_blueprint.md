# VAR Odası -- Complete Project Blueprint

Author: Musab Kara Project Plan Purpose: Build an automated platform
that detects controversial referee decisions in football matches.

This document contains the full plan including:

-   Vision
-   System architecture
-   Data pipeline
-   Database schema
-   Web crawler strategy
-   AI detection system
-   Cursor prompts
-   Website structure
-   Analytics features
-   SEO strategy
-   Growth roadmap

------------------------------------------------------------------------

# 1. Project Vision

VAR Odası is a football analytics platform focused on detecting and
analyzing controversial referee decisions in matches.

The platform will automatically collect data from sports websites,
forums, and discussions and detect controversial referee decisions such
as:

-   penalty debates
-   red card debates
-   offside decisions
-   VAR interventions
-   referee mistakes

Output will include:

Match timelines Referee statistics Team controversy statistics
Commentator opinions

------------------------------------------------------------------------

# 2. System Architecture

Data Pipeline:

Internet Sources ↓ Crawler (Scrapy + Playwright) ↓ Parser
(BeautifulSoup) ↓ AI Event Detection ↓ Database (PostgreSQL) ↓ Vector
Search (Qdrant) ↓ API (FastAPI) ↓ Website

Main project structure:

backend/ crawler/ ai/ database/ api/ scripts/ docs/

------------------------------------------------------------------------

# 3. Technology Stack

Backend: Python

Frameworks:

FastAPI Scrapy Playwright BeautifulSoup

Database:

PostgreSQL

Vector Search:

Qdrant

AI:

sentence-transformers LLM classification

Scheduler:

APScheduler or Celery

------------------------------------------------------------------------

# 4. Database Schema

teams - id - name - league

matches - id - home_team_id - away_team_id - date - season

referees - id - name - nationality

events - id - match_id - minute - event_type - description -
confidence_score

sources - id - event_id - url - site_name - author - published_date

commentators - id - name - channel

commentary_opinions - id - commentator_id - event_id - opinion -
confidence

------------------------------------------------------------------------

# 5. Web Crawler Plan

The crawler will collect discussions about football matches.

Main targets:

Forums Ekşi Sözlük

Sports Media beIN Sports NTV Spor Fanatik Fotomaç

Blogs and Fan Sites

Crawler technologies:

Scrapy Playwright BeautifulSoup

Crawler spiders:

eksi_spider sports_news_spider forum_spider

Data extracted:

page_title url publish_date article_text match_reference

Important keywords:

penaltı kırmızı kart ofsayt VAR hakem hatası

Crawler protections:

rate limiting retry logic proxy rotation user-agent rotation

------------------------------------------------------------------------

# 6. AI Event Detection System

The AI system analyzes scraped text and detects controversial referee
decisions.

Input:

Article text

Output example:

{ match: "Fenerbahce vs Galatasaray", minute: 34, event_type: "penalty
debate", description: "Possible penalty position", confidence: 0.87 }

Detected event types:

penalty debate red card debate offside debate foul debate VAR
intervention referee mistake

AI tasks:

detect team names detect minute references detect referee decisions
merge duplicate events

------------------------------------------------------------------------

# 7. API Layer

Framework: FastAPI

Endpoints:

GET /matches

GET /matches/{id}

GET /matches/{id}/events

GET /events

GET /controversial-events

GET /teams/{id}

GET /referees

GET /statistics/referees

GET /statistics/teams

API features:

pagination filtering caching

------------------------------------------------------------------------

# 8. Automation System

Crawler should run automatically every 6 hours.

Pipeline:

crawl parse AI detection database storage duplicate removal

Tools:

APScheduler Celery

------------------------------------------------------------------------

# 9. Website Features ✅

Core pages:

Match Page Team Page Referee Page Season Controversy Index

Example match page:

Fenerbahce vs Galatasaray

34' penalty debate 61' red card debate 79' VAR review

Additional sections:

Referee statistics Team controversy statistics Commentator opinions

------------------------------------------------------------------------

# 10. Analytics Features ✅

Referee Analysis

Example:

Referee: Halil Umut Meler

matches officiated: 30 controversial decisions: 12 VAR interventions: 5

Team Analysis

Example:

Fenerbahce

penalty debates: 8 red card debates: 4 offside debates: 3

Commentator Tracking

Track which commentators support or oppose referee decisions.

------------------------------------------------------------------------

# 11. Cursor Prompts

Use these prompts inside Cursor to build the project.

PROJECT SETUP PROMPT ✅

Create a backend system for a football referee decision analytics
platform.

Tech stack:

Python FastAPI PostgreSQL Scrapy Playwright BeautifulSoup Qdrant
sentence-transformers

Generate project structure:

backend/ crawler/ ai/ database/ api/ scripts/

Generate requirements.txt and README.md.

------------------------------------------------------------------------

DATABASE PROMPT ✅

Create SQLAlchemy models for:

teams matches referees events sources commentators commentary_opinions

Include relationships and migrations.

------------------------------------------------------------------------

CRAWLER PROMPT ✅

Implement Scrapy spiders for:

sports news websites fan forums football blogs

Add Playwright support.

Extract:

title url publish date article text match reference

------------------------------------------------------------------------

AI DETECTION PROMPT ✅

Create an AI module that detects controversial referee decisions from
text.

Return structured JSON events.

------------------------------------------------------------------------

API PROMPT ✅

Create a FastAPI API serving:

matches events teams referees

Include pagination and filtering.

------------------------------------------------------------------------

# 12. SEO Strategy ✅

High traffic pages:

/superlig-tartismali-pozisyonlar-2025

/team/fenerbahce

/referee/halil-umut-meler

/match/fenerbahce-galatasaray

SEO content types:

match timelines season lists referee statistics team statistics

Example SEO article:

2025 Süper Lig Tartışmalı Pozisyonlar

------------------------------------------------------------------------

# 13. Growth Strategy ✅

Add features that attract users:

fan voting system controversy rating match timeline visualization
referee rankings

Potential viral pages:

Which referee gives the most controversial decisions? Which team
benefits most from VAR?

------------------------------------------------------------------------

# 14. Long Term Vision

VAR Odası can evolve into a full football analytics platform.

Future features:

AI referee bias detection interactive match visualizations crowdsourced
referee analysis machine learning prediction of referee decisions
