import { getTeamMembers, getInvites } from '../../actions/team';
import { InviteMemberForm } from './components/InviteMemberForm';
import { InviteCard } from './components/InviteCard';
import { User, Clock, ShieldCheck, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function TeamPage() {

    const invites = await getInvites();

    // Fix for members data if needed (if join returns unexpected structure)
    // The query returns `user:profiles(...)` so we map it.
    const members = (await getTeamMembers()) as any[];

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-white">Equipe</h1>
                <InviteMemberForm />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Members */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-neutral-400 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Membros Ativos
                    </h2>

                    <div className="space-y-3">
                        {members.map((member) => (
                            <div key={member.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold border border-neutral-700">
                                    {member.user?.avatar_url ? (
                                        <img src={member.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        member.user?.full_name?.[0] || member.user?.email?.[0] || '?'
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">{member.user?.full_name || 'Usuário'}</h3>
                                    <p className="text-sm text-neutral-500">{member.user?.email}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${member.role === 'owner' ? 'bg-purple-500/20 text-purple-400' :
                                        member.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-neutral-800 text-neutral-400'
                                        }`}>
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Invites */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-neutral-400 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Convites Pendentes
                    </h2>

                    {invites.length === 0 ? (
                        <div className="p-8 border border-neutral-800 border-dashed rounded-xl text-center text-neutral-600">
                            Nenhum convite pendente.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invites.map((invite: any) => (
                                <InviteCard key={invite.id} invite={invite} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
