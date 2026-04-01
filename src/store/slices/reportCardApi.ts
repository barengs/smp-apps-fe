import { smpApi } from '../baseApi';

export interface ReportCardStudent {
    id: number;
    first_name: string;
    last_name: string;
    nisn: string;
    nipd: string;
}

export interface ClassStudentsResponse {
    status: string;
    message: string;
    data: {
        class_group: any;
        students: ReportCardStudent[];
        academic_year_id: number | null;
        academic_quarter_id: string;
    };
}

export interface StudentReportResponse {
    status: string;
    message: string;
    data: {
        student: any;
        class_group: any;
        academic_year: any;
        academic_quarter_id: string;
        curriculum: string;
        assessments: any[];
    };
}

export const reportCardApi = smpApi.injectEndpoints({
    endpoints: (builder) => ({
        getClassStudentsForReport: builder.query<ClassStudentsResponse, { classGroupId: number; academic_quarter_id?: string; academic_year_id?: string }>({
            query: ({ classGroupId, academic_quarter_id, academic_year_id }) => {
                let params = new URLSearchParams();
                if (academic_quarter_id) params.append('academic_quarter_id', academic_quarter_id);
                if (academic_year_id) params.append('academic_year_id', academic_year_id);
                return `main/report-card/class/${classGroupId}?${params.toString()}`;
            },
            providesTags: (result, error, arg) => [{ type: 'ReportCard', id: `CLASS_${arg.classGroupId}` }],
        }),
        getStudentReportCard: builder.query<StudentReportResponse, { classGroupId: number; studentId: number; academic_quarter_id?: string; academic_year_id?: string }>({
            query: ({ classGroupId, studentId, academic_quarter_id, academic_year_id }) => {
                let params = new URLSearchParams();
                if (academic_quarter_id) params.append('academic_quarter_id', academic_quarter_id);
                if (academic_year_id) params.append('academic_year_id', academic_year_id);
                return `main/report-card/student/${classGroupId}/${studentId}?${params.toString()}`;
            },
            providesTags: (result, error, arg) => [{ type: 'ReportCard', id: `STUDENT_${arg.studentId}` }],
        }),
    }),
});

export const {
    useGetClassStudentsForReportQuery,
    useGetStudentReportCardQuery
} = reportCardApi;
