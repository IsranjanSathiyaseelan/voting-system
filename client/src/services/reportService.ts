import { api } from "./api";

export const reportService = {
  async exportExcel(electionId: number): Promise<void> {
    const response = await api.get(`/reports/elections/${electionId}/export/excel`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `election-${electionId}-results.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async exportPdf(electionId: number): Promise<void> {
    const response = await api.get(`/reports/elections/${electionId}/export/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `election-${electionId}-results.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
