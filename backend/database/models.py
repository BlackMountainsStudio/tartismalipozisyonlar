from __future__ import annotations

from datetime import datetime, date
from typing import List

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    league: Mapped[str | None] = mapped_column(String(255), nullable=True)

    home_matches: Mapped[List["Match"]] = relationship(
        back_populates="home_team",
        foreign_keys="Match.home_team_id",
    )
    away_matches: Mapped[List["Match"]] = relationship(
        back_populates="away_team",
        foreign_keys="Match.away_team_id",
    )


class Referee(Base):
    __tablename__ = "referees"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    nationality: Mapped[str | None] = mapped_column(String(255), nullable=True)

    matches: Mapped[List["Match"]] = relationship(back_populates="referee")


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    home_team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", ondelete="RESTRICT"),
        nullable=False,
    )
    away_team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", ondelete="RESTRICT"),
        nullable=False,
    )
    referee_id: Mapped[int | None] = mapped_column(
        ForeignKey("referees.id", ondelete="SET NULL"),
        nullable=True,
    )

    date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    season: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    stadium: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    home_team: Mapped[Team] = relationship(
        back_populates="home_matches",
        foreign_keys=[home_team_id],
    )
    away_team: Mapped[Team] = relationship(
        back_populates="away_matches",
        foreign_keys=[away_team_id],
    )
    referee: Mapped[Referee | None] = relationship(back_populates="matches")

    events: Mapped[List["Event"]] = relationship(back_populates="match")

    __table_args__ = (
        UniqueConstraint(
            "home_team_id",
            "away_team_id",
            "date",
            name="uq_match_teams_date",
        ),
    )


class EventTypeEnum(str, Enum):
    PENALTY_DEBATE = "penalty_debate"
    RED_CARD_DEBATE = "red_card_debate"
    OFFSIDE_DEBATE = "offside_debate"
    FOUL_DEBATE = "foul_debate"
    VAR_INTERVENTION = "var_intervention"
    REFEREE_MISTAKE = "referee_mistake"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    match_id: Mapped[int] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Proje kuralı: minute alanı null olmamalı
    minute: Mapped[int] = mapped_column(Integer, nullable=False)

    event_type: Mapped[EventTypeEnum] = mapped_column(
        Enum(EventTypeEnum, name="event_type_enum"),
        nullable=False,
        index=True,
    )

    description: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    is_controversial: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    match: Mapped[Match] = relationship(back_populates="events")
    sources: Mapped[List["Source"]] = relationship(back_populates="event")
    commentary_opinions: Mapped[List["CommentaryOpinion"]] = relationship(
        back_populates="event",
    )


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    site_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    published_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    event: Mapped[Event] = relationship(back_populates="sources")


class Commentator(Base):
    __tablename__ = "commentators"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    channel: Mapped[str | None] = mapped_column(String(255), nullable=True)

    opinions: Mapped[List["CommentaryOpinion"]] = relationship(back_populates="commentator")


class CommentaryOpinion(Base):
    __tablename__ = "commentary_opinions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    commentator_id: Mapped[int] = mapped_column(
        ForeignKey("commentators.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    opinion: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    commentator: Mapped[Commentator] = relationship(back_populates="opinions")
    event: Mapped[Event] = relationship(back_populates="commentary_opinions")

