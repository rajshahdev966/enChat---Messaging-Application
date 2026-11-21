import { useWatch } from 'react-hook-form'
export default function ProfileLiveText({ control, name }) {
  const value = useWatch({ control, name }) || ''
  return name === 'bio' ? value.length : value.split(' ').map(part => part[0]).slice(0, 2).join('')
}
