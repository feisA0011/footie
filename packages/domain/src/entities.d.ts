export type CanonicalId = `${'cmp' | 'ssn' | 'tem' | 'ply' | 'mtc'}_${string}`;
export type ProviderName = 'fixture' | 'statsbomb' | 'wyscout' | 'opta' | 'custom';
export type MatchStatus = 'scheduled' | 'live' | 'paused' | 'finished' | 'postponed' | 'cancelled';
export interface SourceMetadata {
    readonly provider: ProviderName;
    readonly providerEntityId: string;
    readonly fetchedAt: string;
    readonly confidence: number;
}
export interface Competition {
    readonly id: `cmp_${string}`;
    readonly slug: string;
    readonly name: string;
    readonly countryCode?: string;
    readonly level?: number;
}
export interface Season {
    readonly id: `ssn_${string}`;
    readonly competitionId: Competition['id'];
    readonly label: string;
    readonly startDate: string;
    readonly endDate: string;
    readonly isCurrent: boolean;
}
export interface Team {
    readonly id: `tem_${string}`;
    readonly slug: string;
    readonly name: string;
    readonly countryCode?: string;
}
export interface Player {
    readonly id: `ply_${string}`;
    readonly slug: string;
    readonly displayName: string;
    readonly primaryPosition?: string;
    readonly birthDate?: string;
    readonly nationality?: string;
}
export interface Match {
    readonly id: `mtc_${string}`;
    readonly seasonId: Season['id'];
    readonly competitionId: Competition['id'];
    readonly kickoffAt: string;
    readonly homeTeamId: Team['id'];
    readonly awayTeamId: Team['id'];
    readonly status: MatchStatus;
    readonly homeScore?: number;
    readonly awayScore?: number;
    readonly sources: readonly SourceMetadata[];
}
export interface ProviderMapping {
    readonly canonicalId: CanonicalId;
    readonly entityType: 'competition' | 'season' | 'team' | 'player' | 'match';
    readonly provider: ProviderName;
    readonly providerEntityId: string;
}
export interface ValidationIssue {
    readonly code: string;
    readonly severity: 'info' | 'warning' | 'error';
    readonly entityId?: CanonicalId;
    readonly message: string;
}
export interface PublishRecord {
    readonly recordId: string;
    readonly batchId: string;
    readonly promotedAt: string;
    readonly entityIds: readonly CanonicalId[];
    readonly validationIssueCount: number;
}
//# sourceMappingURL=entities.d.ts.map