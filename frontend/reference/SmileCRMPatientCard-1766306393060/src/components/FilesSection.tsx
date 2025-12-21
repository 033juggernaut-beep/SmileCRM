/**
 * Medical files section - X-rays, photos, documents
 * - Section title
 * - Grid of file thumbnails with type labels
 * - Helper text for file types
 * - Empty state
 * - Add file button
 * - Collapsible wrapper
 */

import { Plus, Image, FileText, Scan } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { FilesSectionProps, MedicalFile } from '../types';

/**
 * Get display name and helper text for file based on type
 */
function getFileDisplayInfo(file: MedicalFile): { name: string; helper?: string } {
  switch (file.type) {
    case 'xray':
      return {
        name: 'Рентген (X-ray)',
        helper: 'Снимки рентгена пациента',
      };
    case 'document':
      return {
        name: 'План лечения (PDF)',
        helper: 'Документ для пациента',
      };
    case 'photo':
    default:
      return {
        name: file.name,
      };
  }
}

function FileIcon({
  type,
  isDark,
}: {
  type: MedicalFile['type'];
  isDark: boolean;
}) {
  const iconClass = `w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  switch (type) {
    case 'xray':
      return <Scan className={iconClass} />;
    case 'photo':
      return <Image className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
}

export function FilesSection({
  files,
  isDark,
  onAddFile,
  defaultOpen = false,
}: FilesSectionProps) {
  const isEmpty = files.length === 0;

  const addButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAddFile();
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
        isDark
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }`}
    >
      <Plus className="w-3 h-3" />
      <span>Добавить</span>
    </button>
  );

  return (
    <CollapsibleSection
      title="Файлы"
      isDark={isDark}
      defaultOpen={defaultOpen}
      headerAction={addButton}
    >
      {isEmpty ? (
        <div className="py-6 text-center">
          <p
            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Файлы не добавлены
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((file) => {
            const displayInfo = getFileDisplayInfo(file);
            
            return (
              <button
                key={file.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-slate-700/40 hover:bg-slate-700/60'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-slate-600' : 'bg-slate-200'
                  }`}
                >
                  <FileIcon type={file.type} isDark={isDark} />
                </div>

                {/* File Name */}
                <span
                  className={`text-xs text-center font-medium truncate w-full ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  {displayInfo.name}
                </span>

                {/* Helper Text */}
                {displayInfo.helper && (
                  <span
                    className={`text-xs text-center truncate w-full -mt-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {displayInfo.helper}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </CollapsibleSection>
  );
}
