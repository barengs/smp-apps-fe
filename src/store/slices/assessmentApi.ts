import { smpApi } from '../baseApi';
import { ClassScheduleDetail } from './classScheduleApi';

export interface AssessmentComponent {
    name: string;
    weight: number;
}

export interface AssessmentFormula {
    id?: number;
    class_schedule_detail_id: number;
    name: string;
    type: 'standar_k13' | 'merdeka' | 'custom';
    knowledge_formula: AssessmentComponent[];
    skill_formula: AssessmentComponent[];
    attendance_weight: number;
}

export interface StudentAssessment {
    id?: number;
    class_schedule_detail_id?: number;
    student_id: number;
    semester?: '1' | '2';
    knowledge_scores?: Record<string, number>;
    skill_scores?: Record<string, number>;
    attitude_spiritual?: 'A' | 'B' | 'C' | 'D';
    attitude_social?: 'A' | 'B' | 'C' | 'D';
    attitude_description?: string;
    final_knowledge_score?: number;
    final_skill_score?: number;
    final_score?: number;
    assessment_scores?: any[]; // To match relation from backend
}

export interface AssessmentResponse {
    status: string;
    message: string;
    data: any;
}

export interface SaveScoreRequest {
    class_schedule_detail_id: number;
    semester: '1' | '2';
    assessments: StudentAssessment[];
}

export const assessmentApi = smpApi.injectEndpoints({
    endpoints: (builder) => ({
        getAssessmentDetail: builder.query<AssessmentResponse, { detailId: number; semester: string }>({
            query: ({ detailId, semester }) => `main/assessment/${detailId}?semester=${semester}`,
            providesTags: (result, error, { detailId }) => [{ type: 'Assessment', id: detailId }],
        }),
        getAssessmentFormula: builder.query<AssessmentResponse, number>({
            query: (detailId) => `main/assessment/formula/${detailId}`,
            providesTags: (result, error, detailId) => [{ type: 'AssessmentFormula', id: detailId }],
        }),
        saveAssessmentFormula: builder.mutation<AssessmentResponse, AssessmentFormula>({
            query: (formula) => ({
                url: 'main/assessment/formula',
                method: 'POST',
                body: formula,
            }),
            invalidatesTags: (result, error, { class_schedule_detail_id }) => [{ type: 'AssessmentFormula', id: class_schedule_detail_id }],
        }),
        saveAssessmentScores: builder.mutation<AssessmentResponse, SaveScoreRequest>({
            query: (payload) => ({
                url: 'main/assessment/score',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (result, error, { class_schedule_detail_id }) => [{ type: 'Assessment', id: class_schedule_detail_id }],
        }),
        getAssessmentReport: builder.query<AssessmentResponse, { detailId: number; semester: string }>({
            query: ({ detailId, semester }) => `main/assessment/report/${detailId}?semester=${semester}`,
            providesTags: (result, error, { detailId }) => [{ type: 'AssessmentReport', id: detailId }],
        }),
    }),
});

export const {
    useGetAssessmentDetailQuery,
    useGetAssessmentFormulaQuery,
    useSaveAssessmentFormulaMutation,
    useSaveAssessmentScoresMutation,
    useGetAssessmentReportQuery,
} = assessmentApi;
