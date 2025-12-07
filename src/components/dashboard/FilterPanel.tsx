'use client';

interface FilterPanelProps {
  device: 'pc' | 'mo' | '';
  gender: 'm' | 'f' | '';
  ages: string[];
  onDeviceChange: (device: 'pc' | 'mo' | '') => void;
  onGenderChange: (gender: 'm' | 'f' | '') => void;
  onAgesChange: (ages: string[]) => void;
}

const AGE_OPTIONS = [
  { value: '10', label: '10대' },
  { value: '20', label: '20대' },
  { value: '30', label: '30대' },
  { value: '40', label: '40대' },
  { value: '50', label: '50대' },
  { value: '60', label: '60대 이상' },
];

export function FilterPanel({
  device,
  gender,
  ages,
  onDeviceChange,
  onGenderChange,
  onAgesChange,
}: FilterPanelProps) {
  const handleAgeToggle = (age: string) => {
    if (ages.includes(age)) {
      onAgesChange(ages.filter((a) => a !== age));
    } else {
      onAgesChange([...ages, age]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        필터 설정
      </h3>

      <div className="space-y-4">
        {/* 기기 필터 */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">기기</label>
          <div className="flex gap-2 mt-1">
            {[
              { value: '', label: '전체' },
              { value: 'pc', label: 'PC' },
              { value: 'mo', label: '모바일' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onDeviceChange(option.value as 'pc' | 'mo' | '')}
                className={`px-3 py-1 rounded text-sm ${
                  device === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 성별 필터 */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">성별</label>
          <div className="flex gap-2 mt-1">
            {[
              { value: '', label: '전체' },
              { value: 'm', label: '남성' },
              { value: 'f', label: '여성' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onGenderChange(option.value as 'm' | 'f' | '')}
                className={`px-3 py-1 rounded text-sm ${
                  gender === option.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 연령 필터 */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">연령</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAgeToggle(option.value)}
                className={`px-2 py-1 rounded text-xs ${
                  ages.includes(option.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
