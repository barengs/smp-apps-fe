import React, { forwardRef } from 'react';

interface PrintJadwalPelajaranProps {
  data: any[];
  academicYear: any;
}

export const PrintJadwalPelajaran = forwardRef<HTMLDivElement, PrintJadwalPelajaranProps>(
  ({ data, academicYear }, ref) => {
    // Group data by Education -> Day
    const groupedData = data.reduce((acc, curr) => {
      const education = curr.education?.institution_name || 'Tanpa Jenjang';
      const day = curr.day || '-';
      
      if (!acc[education]) {
        acc[education] = {};
      }
      if (!acc[education][day]) {
        acc[education][day] = [];
      }
      acc[education][day].push(curr);
      
      return acc;
    }, {} as Record<string, Record<string, any[]>>);

    const sortDays = (a: string, b: string) => {
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const indexA = days.indexOf(a) !== -1 ? days.indexOf(a) : 99;
      const indexB = days.indexOf(b) !== -1 ? days.indexOf(b) : 99;
      return indexA - indexB;
    };

    return (
      <div className="hidden">
        <div ref={ref} className="p-8 bg-white text-black w-full" style={{ fontFamily: 'sans-serif' }}>
          <style type="text/css" media="print">
            {`
              @page { size: landscape; margin: 20mm; }
              body { -webkit-print-color-adjust: exact; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              tfoot { display: table-footer-group; }
              .page-break { page-break-before: always; }
              .avoid-break { page-break-inside: avoid; }
            `}
          </style>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold uppercase">Jadwal Pelajaran</h1>
            <p className="text-lg">
              Tahun Ajaran: {academicYear ? `${academicYear.year} ${academicYear.periode ? '(' + academicYear.periode + ')' : ''}` : '-'}
            </p>
          </div>

          {Object.entries(groupedData).map(([education, daysData], edIndex) => {
            const sortedDays = Object.keys(daysData).sort(sortDays);

            return (
              <div key={education} className={edIndex > 0 ? "page-break" : ""}>
                <h2 className="text-xl font-bold mt-6 mb-2 border-b-2 border-black pb-1 uppercase">{education}</h2>
                
                {sortedDays.map((day) => {
                  const schedulesForDay = daysData[day];
                  
                  // Group by Class for this Day
                  const classesMap = schedulesForDay.reduce((acc, curr) => {
                    const className = curr.classroom?.name || 'Tanpa Kelas';
                    if (!acc[className]) acc[className] = [];
                    acc[className].push(curr);
                    return acc;
                  }, {} as Record<string, any[]>);

                  const sortedClasses = Object.keys(classesMap).sort((a, b) => a.localeCompare(b));

                  return (
                    <div key={day} className="mb-6 avoid-break">
                      <h3 className="text-lg font-semibold mb-2 bg-gray-100 p-2 uppercase">Hari: {day}</h3>
                      <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="border border-gray-300 p-2 text-left w-32">Kelas</th>
                            <th className="border border-gray-300 p-2 text-left w-32">Waktu</th>
                            <th className="border border-gray-300 p-2 text-left">Mata Pelajaran</th>
                            <th className="border border-gray-300 p-2 text-left">Guru</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedClasses.map((className) => {
                            const classSchedules = classesMap[className].sort((a, b) => {
                              const timeA = a.lesson_hour?.start_time || '';
                              const timeB = b.lesson_hour?.start_time || '';
                              return timeA.localeCompare(timeB);
                            });

                            return classSchedules.map((schedule, idx) => (
                              <tr key={schedule.id}>
                                {idx === 0 && (
                                  <td className="border border-gray-300 p-2 font-medium" rowSpan={classSchedules.length}>
                                    {className}
                                  </td>
                                )}
                                <td className="border border-gray-300 p-2">
                                  {schedule.lesson_hour ? `${schedule.lesson_hour.start_time} - ${schedule.lesson_hour.end_time}` : '-'}
                                </td>
                                <td className="border border-gray-300 p-2 capitalize">{schedule.study?.name || '-'}</td>
                                <td className="border border-gray-300 p-2 capitalize">
                                  {schedule.teacher ? `${schedule.teacher.first_name || ''} ${schedule.teacher.last_name || ''}`.trim() : '-'}
                                </td>
                              </tr>
                            ));
                          })}
                          {sortedClasses.length === 0 && (
                            <tr>
                              <td colSpan={4} className="border border-gray-300 p-2 text-center text-gray-500">Tidak ada jadwal</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            );
          })}
          
          {Object.keys(groupedData).length === 0 && (
            <div className="text-center p-8 text-gray-500 border border-gray-300">
              Tidak ada data jadwal pelajaran untuk tahun ajaran ini.
            </div>
          )}
        </div>
      </div>
    );
  }
);

PrintJadwalPelajaran.displayName = 'PrintJadwalPelajaran';
